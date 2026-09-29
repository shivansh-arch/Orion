import json

from .llm_provider import get_provider


def generate_post(activity: list[dict], provider: str = "ollama") -> str:
    """Generate a candid first-person post from recent activity."""
    client = get_provider(provider)

    messages = [
        {
            "role": "system",
            "content": (
                "Write a short social post in a natural first-person voice. "
                "Keep it specific to the activity provided and sound like a real "
                "person reflecting on their work. Avoid corporate LinkedIn language, "
                "generic lessons, fake excitement, and engagement bait. Do not use "
                "emoji spam. Do not invent details that are not in the activity."
            ),
        },
        {
            "role": "user",
            "content": f"Create a post from this activity:\n{json.dumps(activity)}",
        },
    ]

    return client.chat(messages)