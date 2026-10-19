import os
from dotenv import load_dotenv
from neo4j import AsyncGraphDatabase
load_dotenv()

class Neo4jClient:
    def __init__(self):
        self.driver = AsyncGraphDatabase.driver(
            os.environ["NEO4J_URI"],
            auth=(
                os.environ["NEO4J_USERNAME"],
                os.environ["NEO4J_PASSWORD"],
            ),
        )
        self.database = os.getenv("NEO4J_DATABASE", "neo4j")

    async def connect(self):
        await self.driver.verify_connectivity()
        await self.create_constraints()

    async def create_constraints(self):
        queries = [
            """
            CREATE CONSTRAINT document_id IF NOT EXISTS
            FOR (d:Document) REQUIRE d.id IS UNIQUE
            """,
            """
            CREATE CONSTRAINT chunk_id IF NOT EXISTS
            FOR (c:Chunk) REQUIRE c.id IS UNIQUE
            """,
            """
            CREATE CONSTRAINT entity_id IF NOT EXISTS
            FOR (e:Entity) REQUIRE e.id IS UNIQUE
            """,
        ]

        async with self.driver.session(
            database=self.database
        ) as session:
            for query in queries:
                result = await session.run(query)
                await result.consume()

    async def close(self):
        await self.driver.close()


neo4j_client = Neo4jClient()
