import subprocess
import tempfile
import os


def run_python_code(code: str) -> dict:
    """
    Execute Python code in a temporary file.

    Returns:
        {
            "stdout": str,
            "stderr": str,
            "exit_code": int
        }
    """
    temp_path = None

    try:
        # Create a temporary Python file
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".py",
            delete=False,
            encoding="utf-8"
        ) as temp_file:
            temp_file.write(code)
            temp_path = temp_file.name

        # Execute the file
        result = subprocess.run(
            ["python", temp_path],
            capture_output=True,
            text=True,
            timeout=10
        )

        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "exit_code": result.returncode,
        }

    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": "Execution timed out after 10 seconds.",
            "exit_code": -1,
        }

    except Exception as e:
        return {
            "stdout": "",
            "stderr": str(e),
            "exit_code": -1,
        }

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    code = """
print("Hello from Orion!")

for i in range(3):
    print(i)
"""

    result = run_python_code(code)

    print(result)