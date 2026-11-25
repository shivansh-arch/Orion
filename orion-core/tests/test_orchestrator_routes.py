import unittest

from src.agents.orchestrator import Orchestrator


class FakeClient:
    def __init__(self, reply):
        self.reply = reply
        self.calls = []

    def chat(self, messages, **kwargs):
        self.calls.append(messages)
        return self.reply


class WebRouterTests(unittest.TestCase):
    def test_web_router_never_returns_content_routes(self):
        for reply in ("make_post", "show_activity"):
            with self.subTest(reply=reply):
                self.assertEqual(Orchestrator(FakeClient(reply)).route("make a post"), "research")

    def test_web_router_prompt_lists_only_research_and_code(self):
        client = FakeClient("code")
        Orchestrator(client).route("write a script")
        system_prompt = client.calls[0][0]["content"]

        self.assertIn("research", system_prompt)
        self.assertIn("code", system_prompt)
        self.assertNotIn("show_activity", system_prompt)
        self.assertNotIn("make_post", system_prompt)

    def test_web_run_route_refuses_content_route(self):
        orchestrator = Orchestrator(FakeClient("research"))
        for route in ("make_post", "show_activity"):
            with self.subTest(route=route), self.assertRaises(ValueError):
                orchestrator.run_route(route, "make a post", memory=None)


class CliRouterTests(unittest.TestCase):
    def test_cli_router_keeps_content_routes(self):
        orchestrator = Orchestrator(FakeClient("show_activity"), enable_content_routes=True)
        self.assertEqual(orchestrator.route("show my activity"), "show_activity")


if __name__ == "__main__":
    unittest.main()
