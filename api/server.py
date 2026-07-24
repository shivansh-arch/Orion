from fastapi import FastAPI
from pydantic import BaseModel

from src.client import OrionClient
from src.agents.orchestrator import Orchestrator


class QueryRequest(BaseModel):
    query: str


app = FastAPI(
    title="Orion API",
    version="1.0.0"
)

# Create these once and reuse them
client = OrionClient()
orchestrator = Orchestrator(client)


@app.get("/")
def root():
    return {
        "message": "Orion API is running."
    }


@app.post("/agent/run")
def run_agent(request: QueryRequest):
    result = orchestrator.run(request.query)
    return {
        "response": result
    }