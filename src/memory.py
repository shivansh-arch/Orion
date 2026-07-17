class Memory:
    def __init__(self, client, max_messages=10):
        self.client = client
        self.max_messages = max_messages
        self.messages = []

    def add(self, role, content, tool_calls=None, tool_call_id=None, name=None):
        """Add a new message. Do NOT trim history here."""
        msg = {
            "role": role,
            "content": content
        }
        # Preserve tool-calling protocol fields when present
        if tool_calls is not None:
            msg["tool_calls"] = tool_calls
        if tool_call_id is not None:
            msg["tool_call_id"] = tool_call_id
        if name is not None:
            msg["name"] = name

        self.messages.append(msg)

   def summarize(self):
    """Compress the conversation into a single summary."""

    if not self.messages:
        return

    text_only = []
    for m in self.messages:
        role = m["role"]
        if role == "tool":
            text_only.append({
                "role": "assistant",
                "content": f"[Called tool: {m.get('name', 'unknown')}] Result: {m.get('content', '')}"
            })
        elif role == "assistant" and m.get("tool_calls"):
            calls = ", ".join(
                f"{tc['function']['name']}({tc['function'].get('arguments', '')})"
                for tc in m["tool_calls"]
            )
            text_only.append({
                "role": "assistant",
                "content": f"[Requested tool call(s): {calls}]"
            })
        elif m.get("content"):
            text_only.append({"role": role, "content": m["content"]})

    if not text_only:
        return

    prompt = [
        {
            "role": "system",
            "content": (
                "Summarize the following conversation. "
                "Preserve important facts, user preferences, decisions, "
                "tool calls made (including URLs/arguments), and unresolved tasks. "
                "Be concise."
            )
        }
    ] + text_only

    response = self.client.chat(messages=prompt, temperature=0, max_tokens=200)
    summary = response.strip()

    self.messages = [
        {"role": "assistant", "content": f"Previous conversation summary:\n{summary}"}
    ]
    
    def get_messages(self):
     
        """Return conversation, summarizing first if necessary."""

        if len(self.messages) > self.max_messages:
            self.summarize()

        return self.messages