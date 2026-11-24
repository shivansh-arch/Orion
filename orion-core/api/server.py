import hmac
import os
from typing import Literal

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from src.client import OrionClient
from src.agents.orchestrator import Orchestrator
from src.memory import build_memory

load_dotenv()

INTERNAL_KEY = os.getenv("ORION_INTERNAL_KEY")
if not INTERNAL_KEY:
    raise RuntimeError("ORION_INTERNAL_KEY is missing. Set the same value in orion-core/.env and orion-backend-node/.env.")

MAX_QUERY_CHARS = 2000
MAX_HISTORY_MESSAGES = 20
MAX_HISTORY_CHARS = 20000


class HistoryMessage(BaseModel):
    # Only real chat turns; callers cannot inject system or tool messages.
    role: Literal["user", "assistant"]
    content: str = Field(max_length=MAX_HISTORY_CHARS)


class QueryRequest(BaseModel):
    query: str = Field(min_length=1, max_length=MAX_QUERY_CHARS)
    history: list[HistoryMessage] = Field(default_factory=list, max_length=MAX_HISTORY_MESSAGES)


def require_internal_key(x_orion_internal_key: str = Header(default="")):
    if not hmac.compare_digest(x_orion_internal_key.encode(), INTERNAL_KEY.encode()):
        raise HTTPException(status_code=401, detail="Unauthorized.")


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


@app.post("/agent/run", dependencies=[Depends(require_internal_key)])
def run_agent(request: QueryRequest):

    # Determine which agent should handle the request
    route = orchestrator.route(request.query)

    # Get the correct persona/system prompt for that route
    system_prompt = orchestrator.get_system_prompt(route)

    # Build request-scoped memory
    memory = build_memory(
        client=client,
        system_prompt=system_prompt,
        history=[msg.model_dump() for msg in request.history],
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
