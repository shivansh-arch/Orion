class Memory:
    def __init__(self, client, max_messages=10):
        self.client = client
        self.max_messages = max_messages
        self.messages = []

    def add(self, role, content):
        """Add a new message. Do NOT trim history here."""
        self.messages.append({
            "role": role,
            "content": content
        })

    def summarize(self):
        """Compress the conversation into a single summary."""

        if not self.messages:
            return

        prompt = [
            {
                "role": "system",
                "content": (
                    "Summarize the following conversation. "
                    "Preserve important facts, user preferences, decisions, "
                    "and unresolved tasks. Be concise."
                )
            }
        ] + self.messages

        response = self.client.chat(
            messages=prompt,
            temperature=0,
            max_tokens=200
        )

        # If client.chat returns a message object
        summary = response.strip()

        # Replace entire history with the summary
        self.messages = [
            {
                "role": "assistant",
                "content": f"Previous conversation summary:\n{summary}"
            }
        ]

    def get_messages(self):
        """Return conversation, summarizing first if necessary."""

        if len(self.messages) > self.max_messages:
            self.summarize()

        return self.messages