import os
import subprocess
import sys
import tempfile
import uuid

TIMEOUT_SECONDS = 10

# "docker" (default) runs code in a locked-down container and refuses to run
# if Docker is unavailable. "local" is an explicit opt-in for machines without
# Docker: secrets are hidden, but files, network and resources are NOT isolated.
SANDBOX_MODE = os.getenv("ORION_SANDBOX", "docker").lower()
SANDBOX_IMAGE = os.getenv("ORION_SANDBOX_IMAGE", "python:3.11-slim")

# Only what Python needs to start on the host; everything else (API keys, tokens) stays hidden.
SAFE_ENV_VARS = ("SYSTEMROOT", "TEMP", "TMP", "PATH")


def _result(stdout="", stderr="", exit_code=-1):
    return {"stdout": stdout, "stderr": stderr, "exit_code": exit_code}


def _docker_command(container_name):
    return [
        "docker", "run",
        "--rm", "-i",
        "--name", container_name,
        "--network", "none",
        "--memory", "256m", "--memory-swap", "256m",
        "--cpus", "0.5",
        "--pids-limit", "64",
        "--read-only",
        "--tmpfs", "/tmp:rw,size=16m",
        "--user", "65534:65534",
        "--cap-drop", "ALL",
        "--security-opt", "no-new-privileges",
        SANDBOX_IMAGE,
        "python", "-I", "-",
    ]


def _run_in_docker(code):
    container_name = f"orion-sandbox-{uuid.uuid4().hex[:12]}"

    try:
        result = subprocess.run(
            _docker_command(container_name),
            input=code,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=TIMEOUT_SECONDS,
        )
    except FileNotFoundError:
        return _result(stderr="Sandbox unavailable: Docker is not installed. Code was not run.")
    except subprocess.TimeoutExpired:
        # Killing the docker CLI does not stop the container, so stop it by name.
        subprocess.run(["docker", "kill", container_name], capture_output=True)
        return _result(stderr=f"Execution timed out after {TIMEOUT_SECONDS} seconds.")

    # 125 means docker itself failed (daemon down, bad image), not the user's code.
    if result.returncode == 125:
        return _result(stderr=f"Sandbox unavailable: {result.stderr.strip()} Code was not run.")

    if result.returncode == 137:
        return _result(result.stdout, "Killed: exceeded the sandbox memory limit (256 MB).", 137)

    return _result(result.stdout, result.stderr, result.returncode)


def _safe_env():
    env = {name: os.environ[name] for name in SAFE_ENV_VARS if name in os.environ}
    env["PYTHONIOENCODING"] = "utf-8"
    return env


def _run_locally(code):
    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".py", delete=False, encoding="utf-8"
        ) as temp_file:
            temp_file.write(code)
            temp_path = temp_file.name

        result = subprocess.run(
            [sys.executable, "-I", temp_path],
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=TIMEOUT_SECONDS,
            env=_safe_env(),
            cwd=tempfile.gettempdir(),
        )
        return _result(result.stdout, result.stderr, result.returncode)

    except subprocess.TimeoutExpired:
        return _result(stderr=f"Execution timed out after {TIMEOUT_SECONDS} seconds.")

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


def run_python_code(code: str) -> dict:
    """Execute Python code and return {"stdout", "stderr", "exit_code"}."""
    try:
        if SANDBOX_MODE == "local":
            return _run_locally(code)
        return _run_in_docker(code)
    except Exception as e:
        return _result(stderr=str(e))


if __name__ == "__main__":
    print(run_python_code('print("Hello from Orion!")\nfor i in range(3):\n    print(i)'))
