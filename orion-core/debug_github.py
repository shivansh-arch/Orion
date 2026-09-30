from dotenv import load_dotenv
load_dotenv()

from src.content_agent.collector import collect_github_activity
from src.content_agent.interviewer import gather_context

activity = collect_github_activity()
print(f"{len(activity)} items collected\n")

if not activity:
    print("No activity to test against.")
else:
    item = activity[0]
    print("Testing interview for:", item, "\n")
    context = gather_context(item)
    print("\n----- COLLECTED CONTEXT -----")
    print(context)