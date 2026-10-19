import asyncio
import logging
from services.graphrag.components.llm_factory import create_llm
from services.graphrag.components.prompt import EXTRACTION_PROMPT
from services.graphrag.components.model import ExtractionResult
from langchain_core.prompts import ChatPromptTemplate
from rich import print as rich_print

logger=logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

llm=create_llm()
structured_llm = llm.with_structured_output(
    ExtractionResult,
    method="json_schema",
    strict=True,
)

prompt=ChatPromptTemplate.from_messages([
    ('system',
     EXTRACTION_PROMPT),
    ('human', 
     'Document chunk:\n{chunk_text}')]
)

extract_pipeline= prompt | structured_llm 

async def extract_from_chunk(
        chunk_text:str,
        max_attempts: int = 3) -> ExtractionResult:

    time_seconds=3


    for i in range(max_attempts):
        
        try:
            # response = await (prompt | llm).ainvoke(
            #     {'chunk_text': chunk_text}
            # )
            
            # print(response)

            response=await extract_pipeline.ainvoke({
                'chunk_text': chunk_text
            })


            if isinstance(response, ExtractionResult):
                return response
    
            return ExtractionResult.model_validate(response)

        except Exception as e:
            logger.error(f"Attempt {i+1} failed.\nError during extraction: {e}. Retrying in {time_seconds}s...\n")

            if i==max_attempts:
                raise

        await asyncio.sleep(2)

    raise RuntimeError("Extraction Failed")


def validate_extraction(result: ExtractionResult) -> ExtractionResult:
    entity_names = {entity.name for entity in result.entities}

    result.relations = [
        relation
        for relation in result.relations
        if relation.source in entity_names
        and relation.target in entity_names
    ]

    return result