import os
import unittest
from datetime import datetime, timezone
from unittest.mock import patch


# The GitHub integration reads this setting while it is imported.
os.environ.setdefault("GITHUB_TOKEN", "test-token")

from src.content_agent import collector


def github_event(repo_name):
    return {
        "created_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "type": "PushEvent",
        "repo": {"name": repo_name},
        "payload": {"before": "old-sha", "head": "new-sha"},
    }


class CollectorAllowlistTests(unittest.TestCase):
    def test_disallowed_repo_is_not_collected_or_fetched(self):
        with (
            patch.object(
                collector,
                "fetch_recent_events",
                return_value=[
                    github_event("other-owner/private-repo"),
                    github_event("shivansh-arch/Orion"),
                ],
            ),
            patch.object(collector, "get_push_messages", return_value=["Allowed commit"]) as get_push_messages,
        ):
            activity = collector.collect_github_activity()

        self.assertEqual([item["repo"] for item in activity], ["shivansh-arch/Orion"])
        get_push_messages.assert_called_once_with("shivansh-arch/Orion", "old-sha", "new-sha")

    def test_direct_event_processing_rejects_disallowed_repo(self):
        with patch.object(collector, "get_push_messages") as get_push_messages:
            result = collector.get_message_for_event(
                "PushEvent",
                "other-owner/private-repo",
                {"before": "old-sha", "head": "new-sha"},
            )

        self.assertEqual(result, (None, None))
        get_push_messages.assert_not_called()


if __name__ == "__main__":
    unittest.main()
