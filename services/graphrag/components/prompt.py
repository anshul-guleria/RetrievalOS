EXTRACTION_PROMPT="""
Extract entities and explicit relationships from the
        supplied document chunk.

        Rules:
        - Only extract facts supported by the text.
        - Use concise, consistent entity names.
        - Use descriptive entity types.
        - Use short, normalized relationship predicates.
        - Include a verbatim evidence excerpt for every relation.
        - Do not invent missing facts.
        - Return empty lists if nothing can be extracted.

        Return ONLY valid JSON matching the required schema.
        Do not return Markdown, tables, explanations, or code fences.

"""