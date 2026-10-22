from neo4j import AsyncDriver
from services.graphrag.db.neo4j_client import neo4j_client
from services.graphrag.embedding.google_embeddings import embed_chunk
from services.graphrag.utils.formatter import format_graphrag_chunks_for_llm

VECTOR_INDEX_NAME = "chunk_embedding_index"
DRIVER=neo4j_client.driver

async def retrieve_from_db(
    question: str,
    driver: AsyncDriver = DRIVER,
    database: str | None = None,
    top_k: int = 5,
) -> list[dict]:
    """
    Retrieve semantically similar chunks and related graph fact from Neo4j for a user's question.
    """
    if not question or not question.strip():
        return []

    if top_k < 1:
        raise ValueError("top_k must be at least 1")

    # Convert the question into a vector using the same embedding model used during document ingestion.
    question_embedding = await embed_chunk(question.strip())

    # Search the Neo4j vector index and expand into related entities and relationships.
    query = """
    CALL db.index.vector.queryNodes(
        $index_name,
        $top_k,
        $embedding
    )
    YIELD node, score

    WITH node AS chunk, score

    OPTIONAL MATCH (chunk)-[:MENTIONS]->(entity:Entity)
    OPTIONAL MATCH (entity)-[rel:RELATED_TO]-(related:Entity)

    WITH chunk, score,
         collect(DISTINCT
             CASE WHEN entity IS NULL THEN null
             ELSE {
                 name: entity.name,
                 type: entity.entity_type,
                 description: entity.description
             }
             END
         ) AS entities,
         collect(DISTINCT
             CASE WHEN rel IS NULL THEN null
             ELSE {
                 source: startNode(rel).name,
                 predicate: rel.predicate,
                 target: endNode(rel).name,
                 evidence: rel.evidence
             }
             END
         ) AS relationships

    RETURN
        chunk.id AS chunk_id,
        chunk.text AS text,
        score,
        [e IN entities WHERE e IS NOT NULL] AS entities,
        [r IN relationships WHERE r IS NOT NULL] AS relationships

    ORDER BY score DESC
    """

    selected_database = database or neo4j_client.database
    driver: AsyncDriver = neo4j_client.driver

    async with driver.session(database=selected_database) as session:
        result = await session.run(
            query,
            index_name=VECTOR_INDEX_NAME,
            top_k=top_k,
            embedding=question_embedding,
        )
        records = await result.data()

    return records


async def retrieve_context(
    question: str,
    database: str = "neo4j",
    top_k: int = 5,
    include_score: bool = False,
    include_entities: bool = False,
    score_threshold: float = 0.0,
    include_raw: bool = False
) -> dict:
    """Retrieve chunks and graph facts and format them as context for an LLM prompt."""
    raw_retrieved_context = await retrieve_from_db(
        question=question,
        database=database,
        top_k=top_k,
    )

    if not raw_retrieved_context:
        raise Exception("No relevant information was found in the knowledge graph.")

    formatted_context=format_graphrag_chunks_for_llm(
        chunks=raw_retrieved_context,
        include_score=include_score,
        include_entities=include_entities,
        score_threshold=score_threshold,
    )

    return {
        "raw_results": raw_retrieved_context if include_raw else "raw results turned off",
        "context": formatted_context
    }
