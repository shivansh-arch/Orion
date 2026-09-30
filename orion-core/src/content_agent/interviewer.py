"""Ask for any personal details missing from an activity item."""

import json

from .llm_provider import get_provider


def _ask_model(activity_item, context):
    """Return either one follow-up question or the word ``DONE``."""
    client = get_provider("groq")

    messages = [
        {
            "role": "system",
            "content": (
                "You are helping gather details for a short first-person social "
                "post. Look at the activity item and the answers collected so far. "
                "Ask one brief follow-up question if another detail would make the "
                "post more specific and personal. If there is enough information, "
                "respond with exactly the word DONE and nothing else."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Activity item: {json.dumps(activity_item)}\n"
                f"Context so far: {json.dumps(context)}"
            ),
        },
    ]

    return client.chat(messages)


def gather_context(activity_item, max_questions=5):
    """Collect up to ``max_questions`` answers for one activity item."""
    context_so_far = []

    for _ in range(max_questions):
        response = _ask_model(activity_item, context_so_far)
        print(f"[debug] raw response: {response!r}")
        question = response.strip()

        if question == "DONE":
            break

        answer = input(question + " ")
        context_so_far.append((question, answer))

    return context_so_far
