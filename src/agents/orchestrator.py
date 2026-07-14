from src.agents.researcher import ResearcherAgent
from src.agents.coder import CoderAgent


class Orchestrator:
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
                )
            },
            {
                "role": "user",
                "content": query
            }
        ]

        response = self.client.chat(
            messages=messages,
            temperature=0,
            max_tokens=5
        )

        route = response.strip().lower()

        if route not in ("research", "code"):
            route = "research"

        return route

    def run(self, query, verbose=True):
        agent = self.route(query)

        if verbose:
            print(f"Selected agent: {agent}")

        if agent == "code":
            return self.coder.run(query, verbose=verbose)

        return self.researcher.run(query, verbose=verbose)