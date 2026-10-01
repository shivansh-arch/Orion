# content_agent/integrations/github.py
import os
import requests
from datetime import datetime, timedelta, timezone

GITHUB_TOKEN = os.environ["GITHUB_TOKEN"]
GITHUB_USERNAME = "shivansh-arch"

def fetch_recent_events():
    url = f"https://api.github.com/users/{GITHUB_USERNAME}/events"
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
    }
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()

def get_push_messages(repo_name, before_sha, head_sha):
    url = f"https://api.github.com/repos/{repo_name}/compare/{before_sha}...{head_sha}"
    headers = {
        "Authorization": f"Bearer {os.environ['GITHUB_TOKEN']}",
        "Accept": "application/vnd.github+json",
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except requests.RequestException:
        return []

    return [c["commit"]["message"] for c in response.json().get("commits", [])]
