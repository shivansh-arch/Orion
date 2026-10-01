import json

from .llm_provider import get_provider
from .memory.personal_memory import PERSONAL_STYLE


def generate_post(
    activity_item: dict,
    context: str,
    provider: str = "groq",
) -> str:
    """Generate a candid first-person post from one activity item."""
    client = get_provider(provider)

    messages = [
        {
            "role": "system",
            "content": (
                "Write a short social post in a natural first-person voice. "
                "Keep it specific to the activity provided and sound like a real "
                "person reflecting on their work. Follow this personal writing "
                f"style: {PERSONAL_STYLE} "
                "Preserve any specific reflections or challenges from the gathered "
                "context. Avoid corporate LinkedIn language, "
                "generic lessons, fake excitement, and engagement bait. Do not use "
                "emoji spam. Use only details explicitly present in the activity "
                "item or the gathered context. Do not invent, infer, or embellish "
                "details that are not stated there."
            ),
        },
        {
            "role": "user",
            "content": (
                "Create a post from this activity item and gathered context:\n\n"
                f"Activity item:\n{json.dumps(activity_item)}\n\n"
                f"Gathered context:\n{context}"
            ),
        },
    ]

    return client.chat(messages)
