import hashlib
import json
import logging
from neo4j import AsyncDriver
from services.graphrag.components.model import ExtractionResult

logger = logging.getLogger(__name__)


def stable_id(*parts: str) -> str:
    """
    Generate a deterministic SHA-256 ID from the given values.
    The same inputs always produce the same ID.
    """
    payload = json.dumps(
        parts,
        ensure_ascii=False,
        separators=(",", ":"),
    )

    return hashlib.sha256(
        payload.encode("utf-8")
    ).hexdigest()


def entity_id(name: str, entity_type: str) -> str:
    """
    Generate a stable ID for an entity based on its name and type.
    """
    return stable_id(
        "entity",
        name.strip().lower(),
        entity_type.strip().lower()
    )


async def persist_chunk(
    driver: AsyncDriver,
    source: str,
    chunk_index: int,
    chunk_text: str,
    result: ExtractionResult,
    embedding: list[float],
    database: str = "neo4j",
) -> dict:
    """
    Persist a document, chunk, entities, and relationships
    in Neo4j within a single write transaction.

    Graph schema:

        (Document)-[:HAS_CHUNK]->(Chunk)
        (Chunk)-[:MENTIONS]->(Entity)
        (Entity)-[:RELATED_TO {
            predicate,
            evidence
        }]->(Entity)
    """

    # Generate document and chunk IDs
    document_id = stable_id("document", source)

    chunk_id = stable_id(
        "chunk",
        document_id,
        str(chunk_index),
        chunk_text,
    )

    # Prepare entity data
    entities_by_name = {}

    entities = []

    for entity in result.entities:
        current_entity_id = entity_id(
            entity.name,
            entity.entity_type,
        )

        entity_data = {
            "id": current_entity_id,
            "name": entity.name,
            "entity_type": entity.entity_type,
            "description": entity.description,
        }

        entities.append(entity_data)

        entities_by_name.setdefault(
            entity.name,
            entity_data,
        )


    relations = []

    for relation in result.relations:
        source_entity = entities_by_name.get(
            relation.source
        )

        target_entity = entities_by_name.get(
            relation.target
        )

        if source_entity is None or target_entity is None:
            logger.warning(
                "Skipping relationship because an endpoint "
                "was not found: %s -> %s",
                relation.source,
                relation.target,
            )
            continue

        relations.append(
            {
                "source_id": source_entity["id"],
                "target_id": target_entity["id"],
                "predicate": relation.predicate,
                "evidence": relation.evidence,
            }
        )

    async def write(tx):
        # 1. Create or match the document.
        query = """
        MERGE (d:Document {id: $document_id})
        SET d.source = $source
        """

        res = await tx.run(
            query,
            document_id=document_id,
            source=source,
        )
        await res.consume()

        # 2. Create or match the chunk and connect it to its document.
        query = """
        MATCH (d:Document {id: $document_id})

        MERGE (c:Chunk {id: $chunk_id})

        SET c.text = $text,
            c.index = $chunk_index,
            c.embedding = $embedding

        MERGE (d)-[:HAS_CHUNK]->(c)
        """

        res = await tx.run(
            query,
            document_id=document_id,
            chunk_id=chunk_id,
            text=chunk_text,
            chunk_index=chunk_index,
            embedding=embedding
        )
        await res.consume()

        # 3. Create or update entities and connect each entity to the current chunk.
        if entities:
            query = """
            UNWIND $entities AS item

            MERGE (e:Entity {id: item.id})

            SET e.name = item.name,
                e.entity_type = item.entity_type,
                e.description = item.description

            WITH e, item

            MATCH (c:Chunk {id: $chunk_id})

            MERGE (c)-[:MENTIONS]->(e)
            """

            res = await tx.run(
                query,
                entities=entities,
                chunk_id=chunk_id,
            )
            await res.consume()

        # 4. Create or match relationships between entities.
        if relations:
            query = """
            UNWIND $relations AS item

            MATCH (s:Entity {id: item.source_id})
            MATCH (t:Entity {id: item.target_id})

            MERGE (s)-[r:RELATED_TO {
                predicate: item.predicate,
                evidence: item.evidence
            }]->(t)
            """

            res = await tx.run(
                query,
                relations=relations,
            )
            await res.consume()

        return {
            "document_id": document_id,
            "chunk_id": chunk_id,
            "entities_saved": len(entities),
            "relations_saved": len(relations),
        }

    # Open a session and execute the transaction
    async with driver.session(
        database=database
    ) as session:
        stats = await session.execute_write(write)

    logger.info(
        "Saved chunk %s: %s entities, %s relationships",
        chunk_index,
        stats["entities_saved"],
        stats["relations_saved"],
    )

    return stats