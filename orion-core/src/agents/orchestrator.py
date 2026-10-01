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
        "show_activity": "Handles showing the user's recent GitHub/LeetCode activity.",
        "make_post": "Handles generating a LinkedIn-style post from recent activity.",
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
                    "Classify the user's request as one of 'research', 'code', "
                    "'show_activity', or 'make_post'.\n"
                    "Use 'show_activity' when the user wants to view or list their "
                    "recent GitHub or LeetCode activity. Use 'make_post' when they "
                    "want a LinkedIn or social post based on that recent activity. "
                    "Use 'research' for factual questions or web research, and "
                    "'code' for programming tasks.\n"
                    "Reply with exactly one of those four route names."
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
            max_tokens=50,
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

        if route == "show_activity":
            from src.content_agent.cli import show_activity

            return show_activity()

        if route == "make_post":
            from src.content_agent.cli import run_post_flow

            return run_post_flow()

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
