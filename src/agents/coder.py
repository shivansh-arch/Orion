import json
from src.tools.code_runner import run_python_code
class CoderAgent:
    def __init__(self, client):
        self.client = client

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

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a coding assistant. "
                    "Use the available tools whenever they help answer the user's question."
                )
            },
            {
                "role": "user",
                "content": query
            }
        ]

        for i in range(max_iterations):
            if verbose:
                print(f"\nIteration {i + 1}/{max_iterations}")

            msg = self.client.chat_with_tools(
                messages=messages,
                tools=self.tools_schemas,
                temperature=0,
                max_tokens=800
            )

            if not msg.tool_calls:
                if verbose:
                    print(f"Assistant: {msg.content}")
                return {"answer": msg.content, "iterations": i + 1}

            if hasattr(msg, "model_dump"):
                messages.append(msg.model_dump())
            else:
                messages.append({
                    "role": "assistant",
                    "content": msg.content,
                    "tool_calls": msg.tool_calls
                })

            for tc in msg.tool_calls:
                fn_name = tc.function.name
                fn_args = json.loads(tc.function.arguments or "{}")

                if verbose:
                    print(f"Tool call: {fn_name}")

                if fn_name in self.tools_functions:
                    try:
                        result = self.tools_functions[fn_name](**fn_args)
                    except Exception as e:
                        result = json.dumps({"error": str(e)})
                else:
                    result = json.dumps({"error": f"Unknown tool '{fn_name}'"})

                if verbose:
                    print(f"Tool result:\n{result}")

                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "name": fn_name,
                    "content": str(result)
                })
        
        return {"error": "Max iterations reached."}