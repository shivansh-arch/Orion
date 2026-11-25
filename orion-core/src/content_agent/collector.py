# content_agent/collector.py

ALLOWED_REPOS = frozenset({
    "shivansh-arch/Orion",
    "shivansh-arch/lpu-rag-chatbot",
    "shivansh-arch/LeetCode-Question",
    "shivansh-arch/IP-SAKTI-Sahayak",
})
from datetime import datetime, timedelta, timezone

from .integrations.github import get_push_messages, fetch_recent_events
from .integrations.leetcode import LEETCODE_REPO, get_leetcode_problem

ACTIVITY_DAYS = 10


def is_allowed_repo(repo_name):
    """Return whether a GitHub event belongs to an explicitly approved repo."""
    return isinstance(repo_name, str) and repo_name in ALLOWED_REPOS


def get_commits_for_event(event_type, repo_name, payload):
    """Return (source, commit messages) for one event, or (None, []) to skip it."""
    # Keep this check here as well as in collect_github_activity so a future
    # caller cannot accidentally fetch details for a repository outside the
    # allowlist.
    if not is_allowed_repo(repo_name):
        return None, []

    if event_type == "PushEvent":
        head_sha = payload.get("head")
        if not repo_name or not head_sha:
            return None, []

        if repo_name == LEETCODE_REPO:
            problem = get_leetcode_problem(head_sha)
            return ("leetcode", [problem]) if problem else (None, [])

        before_sha = payload.get("before")
        if not before_sha:
            return None, []

        messages = [m for m in get_push_messages(repo_name, before_sha, head_sha) if m.strip()]
        return ("github", messages) if messages else (None, [])

    if event_type == "PullRequestEvent":
        title = payload.get("pull_request", {}).get("title")
        action = payload.get("action")
        message = f"Pull request {action}: {title}" if action and title else title
        return ("github", [message]) if message else (None, [])

    if event_type == "IssuesEvent":
        title = payload.get("issue", {}).get("title")
        action = payload.get("action")
        message = f"Issue {action}: {title}" if action and title else title
        return ("github", [message]) if message else (None, [])

    return None, []


def collect_github_activity():
    cutoff = datetime.now(timezone.utc) - timedelta(days=ACTIVITY_DAYS)
    activity = []
    seen = set()

    for event in fetch_recent_events():
        created_at = event.get("created_at")
        if not created_at:
            continue

        try:
            timestamp = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        except ValueError:
            continue

        if timestamp < cutoff:
            continue

        event_type = event.get("type")
        repo_name = event.get("repo", {}).get("name")
        if not is_allowed_repo(repo_name):
            continue

        payload = event.get("payload") or {}
        source, commits = get_commits_for_event(event_type, repo_name, payload)
        if not commits:
            continue

        event_key = (source, repo_name, tuple(commits))
        if event_key in seen:
            continue
        seen.add(event_key)

        activity_item = {
            "source": source,
            "event_type": event_type,
            "timestamp": timestamp.isoformat(),
            "repo": repo_name,
            # Full messages: the interviewer, writer and critic use them as context.
            "message": "\n\n".join(commits),
            # One title line per commit, for display.
            "titles": [c.strip().splitlines()[0] for c in commits],
        }
        activity.append(activity_item)

    return activity
