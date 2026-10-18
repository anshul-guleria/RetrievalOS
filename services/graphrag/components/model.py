from pydantic import BaseModel, Field

class Entity(BaseModel):
    name: str = Field(description="The primary name of the entity, capitalized.")
    entity_type: str = Field(description="Broad category: PERSON, ORGANIZATION, CREATIVE_WORK, PLACE, EVENT, or CONCEPT.")
    description: str = Field(default="", description="A short context snippet summarizing what this entity is in the text.")

class Relation(BaseModel):
    source: str = Field(description="The exact name of the source entity.")
    predicate: str = Field(description="The relationship verb or action in ALL_CAPS (e.g., DIRECTED, PLAYS_FOR, LOCATED_IN).")
    target: str = Field(description="The exact name of the target entity.")
    evidence: str = Field(description="The verbatim sentence from the text that proves this relationship exists.")

class ExtractionResult(BaseModel):
    entities: list[Entity] = Field(default_factory=list)
    relations: list[Relation] = Field(default_factory=list)