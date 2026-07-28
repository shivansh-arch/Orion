from src.client import OrionClient
from src.agents.orchestrator import Orchestrator
from src.memory import build_memory
from src.planner import Planner
from src.voice import listen, speak


def main():
    client = OrionClient()
    orchestrator = Orchestrator(client)
    planner = Planner(client)

    voice_mode = False

    print("Orion Agent")
    print("Commands: quit | voice on | voice off | plan: ...")

    while True:
        if voice_mode:
            query = listen()
            if query is None:
                continue
        else:
            query = input("You: ").strip()

        if not query:
            continue

        command = query.lower()

        if command == "quit":
            if voice_mode:
                speak("Goodbye!")
            else:
                print("Goodbye!")
            break

        elif command == "voice on":
            voice_mode = True
            speak("Voice mode enabled.")
            continue

        elif command == "voice off":
            voice_mode = False
            print("Voice mode disabled.")
            continue

        elif command.startswith("plan:"):
            task_query = query[5:].strip()

            result = planner.run(
                task_query,
                orchestrator,
            )

            output = []

            for i, (task, res) in enumerate(
                zip(result["tasks"], result["results"]),
                start=1,
            ):
                print(f"\nTask {i}: {task}")
                print(f"Result: {res}")

                output.append(str(res.get("answer", res)))

            if voice_mode:
                speak(". ".join(output))

        else:
            # Decide which agent should answer
            route = orchestrator.route(query)

            # Get the correct system prompt for that agent
            system_prompt = orchestrator.get_system_prompt(route)

            # Build request-scoped memory
            memory = build_memory(
                client=client,
                system_prompt=system_prompt,
            )

            # Execute using the selected agent
            result = orchestrator.run_route(
                route=route,
                query=query,
                memory=memory,
            )

            print(f"\nResult: {result}")

            if voice_mode:
                speak(result.get("answer", ""))


if __name__ == "__main__":
    main()