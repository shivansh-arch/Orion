# content_agent/cli.py
"""Entry points for the content-agent pipeline: view activity, or build a post."""
from dotenv import load_dotenv
load_dotenv()

from .collector import collect_github_activity
from .interviewer import gather_context
from .writer import generate_post
from .critic import critique_post



def show_activity():
    """Print today's collected GitHub/LeetCode activity."""
    activity = collect_github_activity()

    if not activity:
        print("No activity in the last 24 hours.")
        return activity

    print(f"{len(activity)} item(s) in the last 24 hours:\n")
    for i, item in enumerate(activity, start=1):
        print(f"{i}. [{item['source']}] {item['repo']}")
        print(f"   {item['message']}")
        print(f"   {item['timestamp']}\n")

    return activity


def run_post_flow():
    """Collect activity, let the user pick one item, interview, write, critique."""
    activity = show_activity()
    if not activity:
        return None

    choice = input(f"Pick an item to post about (1-{len(activity)}): ").strip()
    try:
        index = int(choice) - 1
        item = activity[index]
    except (ValueError, IndexError):
        print("Invalid selection.")
        return None

    print("\n--- A few quick questions ---\n")
    context = gather_context(item)

    print("\n--- Generating post ---\n")
    post = generate_post(item, context)
    print(post)

    print("\n--- Checking grounding ---\n")
    verdict = critique_post(post, item, context)
    if verdict.get("grounded"):
        print("✓ Grounded — no unsupported claims found.")
    else:
        print("⚠ Possibly unsupported claims:")
        for claim in verdict.get("unsupported_claims", []):
            print(f"  - {claim}")

    return post


if __name__ == "__main__":
    import sys
    from dotenv import load_dotenv
    load_dotenv()

    if len(sys.argv) > 1 and sys.argv[1] == "activity":
        show_activity()
    else:
        run_post_flow()