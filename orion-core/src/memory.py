class Memory:
    def __init__(self, client, max_messages=10):
        self.client = client
        self.max_messages = max_messages
        self.messages = []

    def add(self, role, content, tool_calls=None, tool_call_id=None, name=None):
        """Add a new message. Do NOT trim history here."""

        msg = {
            "role": role,
            "content": content,
        }

        if tool_calls is not None:
            msg["tool_calls"] = tool_calls

        if tool_call_id is not None:
            msg["tool_call_id"] = tool_call_id

        if name is not None:
            msg["name"] = name

        self.messages.append(msg)

    def summarize(self):
        if not self.messages:
            return

        # --------------------------------------------
        # Separate system message from conversation
        # --------------------------------------------
        system_message = None
        conversation = []

        for msg in self.messages:
            if msg["role"] == "system" and system_message is None:
                system_message = msg
            else:
                conversation.append(msg)

        # --------------------------------------------
        # Find the last user message.
        # Everything from that point onward is the
        # active ReAct chain and must NOT be summarized.
        # --------------------------------------------
        last_user_index = None

        for i in range(len(conversation) - 1, -1, -1):
            if conversation[i]["role"] == "user":
                last_user_index = i
                break

        if last_user_index is None:
            to_summarize = conversation
            preserved_tail = []
        else:
            to_summarize = conversation[:last_user_index]
            preserved_tail = conversation[last_user_index:]

        # Nothing old enough to summarize
        if not to_summarize:
            return

        # --------------------------------------------
        # Convert messages into readable text
        # --------------------------------------------
        summary_lines = []

        for msg in to_summarize:
            role = msg.get("role")

            if role == "user":
                if msg.get("content"):
                    summary_lines.append(
                        f"User: {msg['content']}"
                    )

            elif role == "assistant":

                # Assistant requested tools
                if msg.get("tool_calls"):

                    tool_descriptions = []

                    for tool_call in msg["tool_calls"]:

                        function = tool_call.get("function", {})

                        name = function.get("name", "unknown")

                        arguments = function.get("arguments", "")

                        tool_descriptions.append(
                            f"{name}({arguments})"
                        )

                    summary_lines.append(
                        "Assistant requested tool(s): "
                        + ", ".join(tool_descriptions)
                    )

                # Normal assistant response
                elif msg.get("content"):

                    summary_lines.append(
                        f"Assistant: {msg['content']}"
                    )

            elif role == "tool":

                tool_name = msg.get("name", "tool")

                result = msg.get("content", "")

                summary_lines.append(
                    f"Tool [{tool_name}] returned:\n{result}"
                )

        # Nothing useful to summarize
        if not summary_lines:
            return

        # --------------------------------------------
        # Ask the LLM to summarize
        # --------------------------------------------
        summary_prompt = [
            {
                "role": "system",
                "content": (
                    "Summarize the following conversation while preserving:\n"
                    "- important facts\n"
                    "- decisions\n"
                    "- names\n"
                    "- research findings\n"
                    "- tool usage\n"
                    "- URLs if relevant\n"
                    "- unfinished context\n\n"
                    "Produce a concise but information-dense summary."
                ),
            },
            {
                "role": "user",
                "content": "\n\n".join(summary_lines),
            },
        ]

        summary = self.client.chat(
            messages=summary_prompt,
            temperature=0.2,
            max_tokens=500,
        )

        summary_message = {
            "role": "assistant",
            "content": f"Conversation summary:\n{summary}",
        }

        # --------------------------------------------
        # Rebuild memory
        # --------------------------------------------
        self.messages = []

        if system_message is not None:
            self.messages.append(system_message)

        self.messages.append(summary_message)

        self.messages.extend(preserved_tail)
    def get_messages(self):
        """Return conversation, summarizing first if necessary."""

        if len(self.messages) > self.max_messages:
            self.summarize()

        return self.messages


def build_memory(client, system_prompt, history=None, max_messages=10):
    """
    Create a Memory object initialized with the correct system prompt
    and optional conversation history.
    """
    memory = Memory(client, max_messages=max_messages)

    memory.add("system", system_prompt)

    if history:
        for msg in history:
            memory.add(
                role=msg["role"],
                content=msg.get("content"),
                tool_calls=msg.get("tool_calls"),
                tool_call_id=msg.get("tool_call_id"),
                name=msg.get("name"),
            )

    return memory