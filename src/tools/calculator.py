import ast
import math

def calculate(expression):
    try:
        # Only allow safe math operations
        allowed = {k: v for k, v in math.__dict__.items() if not k.startswith("__")}
        result = eval(expression, {"__builtins__": {}}, allowed)
        return str(result)
    except Exception as e:
        return f"Error: {str(e)}"