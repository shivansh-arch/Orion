import re


class Planner:
    def __init__(self, client):
        self.client = client

    def plan(self, query):
        messages = [
            {
                "role": "system",
                "content": (
                    "You are a planning assistant.\n"
                    "Break down the user's request into a series of steps or tasks.\n"
                    "Reply with a numbered list of tasks."
                ),
            },
            {
                "role": "user",
                "content": query,
            },
        ]

        response = self.client.chat(
            messages=messages,
            temperature=0,
            max_tokens=200,
        )

        return response.strip()

    def execute(self, tasks, orchestrator, verbose=True):
        results = []

        for i, task in enumerate(tasks, start=1):
            if verbose:
                print(f"\nExecuting Task {i}/{len(tasks)}: {task}")

            result = orchestrator.run(task)
            if result is None:
                result = {"answer": "No response for this task."}
            results.append(result)

        return results

    def run(self, query, orchestrator, verbose=True):
        if verbose:
            print(f"Planning for query: {query}")

        tasks_str = self.plan(query)

        tasks = []
        for line in tasks_str.splitlines():
            line = line.strip()
            if line:
                # Remove numbering like "1. " or "2) "
                line = re.sub(r"^\d+[\.\)]\s*", "", line)
                tasks.append(line)

        if verbose:
            print("\nPlanned Tasks:")
            for i, task in enumerate(tasks, start=1):
                print(f"{i}. {task}")

        results = self.execute(tasks, orchestrator, verbose=verbose)

        return {
            "tasks": tasks,
            "results": results,
        }