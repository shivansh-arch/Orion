"""Check whether a generated post is grounded in its source material."""

import json

from .llm_provider import get_provider


def critique_post(
    post: str,
    activity_item: dict,
    context: str,
    provider: str = "groq",
) -> dict:
    """Return a grounding verdict and every unsupported claim in ``post``."""
    client = get_provider(provider)

    messages = [
        {
            "role": "system",
            "content": (
                "You are a strict factual-grounding critic. Compare the generated "
                "post with the activity item and gathered context. List every "
                "specific claim in the post that is not directly stated in those "
                "sources. Be strict: plausible inferences, emotional reactions, "
                "causal explanations, and extra details are unsupported unless the "
                "source explicitly states them. Do not rewrite the post. Return "
                "exactly one JSON object and nothing else with this shape: "
                '{"grounded": true, "unsupported_claims": []}. Set "grounded" '
                "to false when unsupported_claims is not empty."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Activity item:\n{json.dumps(activity_item)}\n\n"
                f"Gathered context:\n{context}\n\n"
                f"Generated post:\n{post}"
            ),
        },
    ]

    response = client.chat(messages)
    print(f"[debug] raw critic response: {response!r}")


    try:
        return json.loads(response)
    except json.JSONDecodeError:
        return {
            "grounded": False,
            "unsupported_claims": ["The critic returned an invalid JSON verdict."],
        }
