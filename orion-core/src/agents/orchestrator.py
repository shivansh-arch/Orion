from src.agents.researcher import ResearcherAgent
from src.agents.coder import CoderAgent


class Orchestrator:
    SYSTEM_PROMPTS = {
        "research": (
            "You are Orion's research assistant.\n"
            "Your job is to answer factual questions accurately using the "
            "available research tools when necessary.\n"
            "Always prefer searching or fetching webpages when additional "
            "information is required.\n"
            "Provide clear, well-structured, and evidence-based answers."
        ),
        "code": (
            "You are Orion's coding assistant.\n"
            "Your job is to help with programming, debugging, algorithms, "
            "and software engineering tasks.\n"
            "When appropriate, use the Python execution tool to verify code.\n"
            "Write clean, correct, and well-explained code."
        ),
    }

    def __init__(self, client):
        self.client = client
        self.researcher = ResearcherAgent(client)
        self.coder = CoderAgent(client)

    def route(self, query):
        messages = [
            {
                "role": "system",
                "content": (
                    "You are a routing assistant.\n"
                    "Classify the user's request as either "
                    "'research' or 'code'.\n"
                    "Reply with exactly one word: research or code."
                ),
            },
            {
                "role": "user",
                "content": query,
            },
        ]

        response = self.client.chat(
            messages=messages,
            temperature=0,
            max_tokens=5,
        )

        route = response.strip().lower()

        if route not in self.SYSTEM_PROMPTS:
            route = "research"

        return route

    def get_system_prompt(self, route):
        """
        Return the system prompt for the selected route.
        """
        return self.SYSTEM_PROMPTS.get(
            route,
            self.SYSTEM_PROMPTS["research"],
        )

    def run_route(self, route, query, memory, verbose=False):
        """
        Execute a query using the already-selected route and prepared Memory.
        """

        if route == "research":
            return self.researcher.run(
                query=query,
                memory=memory,
                verbose=verbose,
            )

        if route == "code":
            return self.coder.run(
                query=query,
                memory=memory,
                verbose=verbose,
            )

        raise ValueError(f"Unknown route: {route}")