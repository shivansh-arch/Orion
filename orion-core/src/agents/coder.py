import json

from src.memory import Memory
from src.tools.code_runner import run_python_code


class CoderAgent:
    def __init__(self, client):
        self.client = client

        # Persistent conversation memory
        self.memory = Memory(client, max_messages=10)

        self.tools_schemas = [
            {
                "type": "function",
                "function": {
                    "name": "run_python_code",
                    "description": "Run code in a secure environment and return the output.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "code": {
                                "type": "string",
                                "description": "The code to run."
                            }
                        },
                        "required": ["code"]
                    }
                }
            }
        ]

        self.tools_functions = {
            "run_python_code": run_python_code
        }

    def run(self, query, max_iterations=10, verbose=True):

        # Add system prompt only once
        if not self.memory.messages:
            self.memory.add(
                "system",
                (
                    "You are a coding assistant. "
                    "Use the available tools whenever they help answer the user's question."
                )
            )

        self.memory.add("user", query)

        activity = ["Started coding task"]
        tools_used = []

        for i in range(max_iterations):

            if verbose:
                print(f"\nIteration {i + 1}/{max_iterations}")

            activity.append(f"Iteration {i + 1}")

            msg = self.client.chat_with_tools(
                messages=self.memory.get_messages(),
                tools=self.tools_schemas,
                temperature=0,
                max_tokens=800
            )

            # ----------------------------
            # Final Answer
            # ----------------------------
            if not msg.tool_calls:

                if verbose:
                    print(f"Assistant: {msg.content}")

                self.memory.add("assistant", msg.content)

                activity.append("Generated final answer")

                return {
                    "answer": msg.content,
                    "iterations": i + 1,
                    "activity": activity,
                    "tools_used": tools_used,
                }

            # ----------------------------
            # Save assistant tool call
            # ----------------------------
            if hasattr(msg, "model_dump"):
                dumped = msg.model_dump(exclude_none=True)
            else:
                dumped = {
                    "role": "assistant",
                    "content": msg.content,
                    "tool_calls": msg.tool_calls,
                }

            self.memory.add(
                "assistant",
                dumped.get("content"),
                tool_calls=dumped.get("tool_calls"),
            )

            # ----------------------------
            # Execute tool calls
            # ----------------------------
            for tc in msg.tool_calls:

                fn_name = tc.function.name
                fn_args = json.loads(tc.function.arguments or "{}")

                tools_used.append(fn_name)
                activity.append(f"Called {fn_name}")

                if verbose:
                    print(f"Tool call: {fn_name}")
                    print(f"Arguments: {fn_args}")

                if fn_name in self.tools_functions:

                    try:
                        result = self.tools_functions[fn_name](**fn_args)

                    except Exception as e:
                        result = json.dumps({"error": str(e)})
                        activity.append(f"{fn_name} failed")

                else:
                    result = json.dumps(
                        {"error": f"Unknown tool '{fn_name}'"}
                    )
                    activity.append(f"Unknown tool: {fn_name}")

                if verbose:
                    print(f"Tool result:\n{result}")

                self.memory.add(
                    "tool",
                    str(result),
                    tool_call_id=tc.id,
                    name=fn_name,
                )

        activity.append("Maximum iterations reached")

        return {
            "answer": "Max iterations reached.",
            "iterations": max_iterations,
            "activity": activity,
            "tools_used": tools_used,
        }