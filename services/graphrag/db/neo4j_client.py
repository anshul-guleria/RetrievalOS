import os
import asyncio
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

    async def close(self):
        await self.driver.close()