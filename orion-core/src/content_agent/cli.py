# content_agent/cli.py
"""Entry points for the content-agent pipeline: view activity, or build a post."""
from dotenv import load_dotenv
load_dotenv()

from datetime import datetime

from rich.console import Console
from rich.markup import escape
from rich.panel import Panel

from .collector import ACTIVITY_DAYS, collect_github_activity
from .interviewer import gather_context
from .writer import generate_post
from .critic import critique_post



console = Console()


def show_activity():
    """Print the recent GitHub/LeetCode activity, one title line per commit."""
    activity = collect_github_activity()
    window = f"the last {ACTIVITY_DAYS} days"

    if not activity:
        console.print(f"No activity in {window}.")
        return activity

    lines = []
    for i, item in enumerate(activity, start=1):
        when = datetime.fromisoformat(item["timestamp"]).strftime("%Y-%m-%d %H:%M UTC")
        label = escape(f"{i}. [{item['source']}] {item['repo']}")
        lines.append(f"[bold]{label}[/bold] [dim]· {when}[/dim]")
        lines.extend(f"   • {escape(title)}" for title in item["titles"])
        lines.append("")

    console.print(Panel(
        "\n".join(lines).rstrip(),
        title=f"{len(activity)} item(s) in {window}",
        border_style="cyan",
    ))
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