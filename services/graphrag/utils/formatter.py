from typing import Any


def format_graphrag_chunks_for_llm(
    chunks: list[dict[str, Any]],
    include_score: bool = False,
    include_entities: bool = False,
    score_threshold: float = 0.0,
) -> str:
    """Formats GraphRAG retrieved chunks and their graph facts into clean LLM context.

    :param chunks: List of chunk dictionaries containing text, entities, and
    relationships.
    :param include_score: Set True to show the relevance score in the chunk
    header, False to hide it.
    :param include_entities: Set True if you want a separate bulleted list of
    entity descriptions.
    :param score_threshold: Optional float to filter out low-confidence chunks
    before formatting.
    :return: Cleanly formatted Markdown string.
    """
    formatted_chunks = []

    for idx, chunk in enumerate(chunks, 1):
        score = chunk.get("score", 0.0)

        # We can still filter by score internally even if we don't show it to the LLM
        if score < score_threshold:
            continue

        raw_text = chunk.get("text", "").strip()

        # Deduplicate relationships (source, predicate, target)
        raw_relations = chunk.get("relationships", [])
        unique_relations: set[tuple[str, str, str]] = set()

        for rel in raw_relations:
            src = rel.get("source", "").strip()
            pred = rel.get("predicate", "").strip()
            tgt = rel.get("target", "").strip()
            if src and pred and tgt:
                unique_relations.add((src, pred, tgt))

        # Build Knowledge Graph lines
        kg_lines = [
            f"- ({src}) -[{pred}]-> ({tgt})"
            for src, pred, tgt in sorted(unique_relations)
        ]

        # Dynamically build header with or without score
        if include_score:
            chunk_header = f"### [CHUNK {idx}] (Relevance Score: {score:.2f})"
        else:
            chunk_header = f"### [CHUNK {idx}]"

        # Build Markdown Section for this chunk
        chunk_section = [chunk_header, "**Passage Content:**", raw_text]

        if kg_lines:
            chunk_section.append("\n**Knowledge Graph Facts:**")
            chunk_section.extend(kg_lines)

        # Optional: Include detailed entity definitions if needed
        if include_entities and chunk.get("entities"):
            entity_lines = [
                f"- **{e['name']}** ({e.get('type', 'ENTITY')}): {e.get('description', '')}"
                for e in chunk["entities"]
                if e.get("name")
            ]
            if entity_lines:
                chunk_section.append("\n**Identified Entities:**")
                chunk_section.extend(entity_lines)

        formatted_chunks.append("\n".join(chunk_section))

    if not formatted_chunks:
        return "No relevant context found."

    header = "## CONTEXT INFORMATION\nUse the following retrieved passages and knowledge graph facts to answer the question:\n\n"
    return header + "\n\n---\n\n".join(formatted_chunks)