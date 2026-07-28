from fastapi import FastAPI
from pydantic import BaseModel

from src.client import OrionClient
from src.agents.orchestrator import Orchestrator
from src.memory import build_memory


class QueryRequest(BaseModel):
    query: str


app = FastAPI(
    title="Orion API",
    version="1.0.0",
)

client = OrionClient()
orchestrator = Orchestrator(client)


@app.get("/")
def root():
    return {
        "message": "Orion API is running."
    }


@app.post("/agent/run")
def run_agent(request: QueryRequest):

    # Determine which agent should handle the request
    route = orchestrator.route(request.query)

    # Get the correct persona/system prompt for that route
    system_prompt = orchestrator.get_system_prompt(route)

    # Build request-scoped memory
    memory = build_memory(
        client=client,
        system_prompt=system_prompt,
        history=None,      # Later replace with MongoDB conversation history
        max_messages=10,
    )

    # Execute using the selected agent
    result = orchestrator.run_route(
        route=route,
        query=request.query,
        memory=memory,
    )

    return {
        "response": result
    }