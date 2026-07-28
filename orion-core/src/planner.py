import re

from src.memory import build_memory


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
        completed_so_far = []  # holds text of prior task+result pairs

        for i, task in enumerate(tasks, start=1):
            if verbose:
                print(f"\nExecuting Task {i}/{len(tasks)}: {task}")

            # Make the task self-contained by embedding prior results
            if completed_so_far:
                context_block = "\n".join(completed_so_far)
                self_contained_task = (
                    f"Previous results:\n{context_block}\n\n"
                    f"Current task: {task}"
                )
            else:
                self_contained_task = task

            # Route based on the rewritten, self-contained task
            route = orchestrator.route(self_contained_task)
            system_prompt = orchestrator.get_system_prompt(route)

            # Fresh, persona-correct memory for this task only
            memory = build_memory(
                client=self.client,
                system_prompt=system_prompt,
            )

            result = orchestrator.run_route(
                route=route,
                query=self_contained_task,
                memory=memory,
                verbose=verbose,
            )

            if result is None:
                result = {"answer": "No response for this task."}

            results.append(result)

            # Record this task's outcome for future tasks to reference
            completed_so_far.append(
                f"Task {i} ({task}): {result.get('answer', '')}"
            )

        return results

    def run(self, query, orchestrator, verbose=True):
        if verbose:
            print(f"Planning for query: {query}")

        tasks_str = self.plan(query)

        tasks = []
        for line in tasks_str.splitlines():
            line = line.strip()
            if not line:
                continue
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