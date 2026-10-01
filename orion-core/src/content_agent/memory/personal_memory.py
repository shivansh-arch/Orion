# content_agent/memory/personal_memory.py
"""Static description of Shivansh's writing voice, injected into the writer prompt.

This is intentionally minimal — expand it only when real generated posts reveal
something specific that doesn't sound like him, not speculatively.
"""

PERSONAL_STYLE = (
    "Write in a proper, grammatically formal register rather than casual or "
    "contraction-heavy phrasing. Sentences can run a bit long, covering more "
    "than one connected thought in a single sentence, rather than being short "
    "and punchy. Keep the tone matter-of-fact, not humorous. End the post with "
    "a genuine question, not a statement."
)