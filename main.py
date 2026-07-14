from src.client import OrionClient
from src.agents.orchestrator import Orchestrator
from src.planner import Planner

def main():
    client = OrionClient()
    orchestrator = Orchestrator(client)
    planner = Planner(client)
    
    print("Orion Agent — type 'quit' to exit")
    print("Prefix with 'plan:' to use planner, otherwise direct routing\n")
    
    while True:
        query = input("You: ").strip()
        # handle quit
        if query.lower() == "quit":
            print("Exiting Orion Agent.")
            break
        # handle plan: prefix → use planner
        elif query.lower().startswith("plan:"):
            task_query = query[5:].strip()
            result = planner.run(task_query, orchestrator)
            print("\nResults:")
            for i, (task, res) in enumerate(zip(result["tasks"], result["results"]), 1):
                print(f"\nTask {i}: {task}")
                print(f"Result: {res}")
        # otherwise → use orchestrator directly
        else:
            result = orchestrator.run(query)
            print(f"Result: {result}")

if __name__ == "__main__":
    main()