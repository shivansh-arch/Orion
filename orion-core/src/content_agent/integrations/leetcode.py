# content_agent/integrations/leetcode.py
import os
import re
import requests

GITHUB_TOKEN = os.environ["GITHUB_TOKEN"]
LEETCODE_REPO = "shivansh-arch/LeetCode-Question"

def get_leetcode_problem(sha):
    url = f"https://api.github.com/repos/{LEETCODE_REPO}/commits/{sha}"
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except requests.RequestException:
        return None

    files = response.json().get("files", [])
    if not files:
        return None

    folder_slug = files[0]["filename"].split("/", 1)[0]
    return re.sub(r"^\d+-", "", folder_slug).replace("-", " ").title()
