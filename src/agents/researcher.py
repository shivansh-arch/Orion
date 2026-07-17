import json

from src.tools.search import search
from src.tools.web import fetch_webpage


class ResearcherAgent:
    def __init__(self, client):
        self.client = client

        self.tools_schemas = [
            {
                "type": "function",
                "function": {
                    "name": "search",
                    "description": "Search for information on the web using Exa and Wikipedia.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "The search query."
                            }
                        },
                        "required": ["query"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "fetch_webpage",
                    "description": "Fetch a webpage and return its clean text content.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "url": {
                                "type": "string",
                                "description": "The webpage URL."
                            }
                        },
                        "required": ["url"]
                    }
                }
            }
        ]

        self.tools_functions = {
            "search": search,
            "fetch_webpage": fetch_webpage
        }

   def run(self, query, max_iterations=10, verbose=True):

        memory = Memory(self.client, max_messages=10)
        memory.add("system", (
            "You are a research assistant. "
            "Use the available tools whenever they help answer the user's question."
        ))
        memory.add("user", query)

        for i in range(max_iterations):
            if verbose:
                print(f"\nIteration {i + 1}/{max_iterations}")

            msg = self.client.chat_with_tools(
                messages=memory.get_messages(),
                tools=self.tools_schemas,
                temperature=0,
                max_tokens=800
            )

            # No tool calls -> final answer
            if not msg.tool_calls:
                if verbose:
                    print(f"Assistant: {msg.content}")
                return {"answer": msg.content, "iterations": i + 1}

            # --- save assistant's tool-call request into memory ---
            if hasattr(msg, "model_dump"):
                dumped = msg.model_dump(exclude_none=True)
            else:
                dumped = {"role": "assistant", "content": msg.content, "tool_calls": msg.tool_calls}

            memory.add(
                "assistant",
                dumped.get("content"),
                tool_calls=dumped.get("tool_calls")
            )

            # --- execute each tool call (uses original SDK msg, attribute access) ---
            for tc in msg.tool_calls:
                fn_name = tc.function.name
                fn_args = json.loads(tc.function.arguments or "{}")

                if verbose:
                    print(f"Tool call: {fn_name}")
                    print(f"Arguments: {fn_args}")

                if fn_name in self.tools_functions:
                    try:
                        result = self.tools_functions[fn_name](**fn_args)
                    except Exception as e:
                        result = json.dumps({"error": str(e)})
                else:
                    result = json.dumps({"error": f"Unknown tool '{fn_name}'"})

                if verbose:
                    print(f"Tool result:\n{result}")

                memory.add("tool", str(result), tool_call_id=tc.id, name=fn_name)

        return {"error": "Max iterations reached without a final answer."}