from src.agents.researcher import ResearcherAgent
from src.agents.coder import CoderAgent


class Orchestrator:
    def __init__(self, client):
        self.client = client
        self.researcher = ResearcherAgent(client)
        self.coder = CoderAgent(client)

        # Store the last selected agent
        self.last_route = None

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

        # Save the selected agent
        self.last_route = route

        return route

    def run(self, query, verbose=False):
        route = self.route(query)
        print(f"Route: {route}")
        
        if route == "research":
            result = self.researcher.run(query)
        else:
            result = self.coder.run(query)
        
        print(f"Result: {result}")  # add this
        return result