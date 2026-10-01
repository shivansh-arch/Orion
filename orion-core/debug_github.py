from dotenv import load_dotenv
load_dotenv()

from src.content_agent.interviewer import gather_context
from src.content_agent.writer import generate_post
from src.content_agent.critic import critique_post

item = {
    "source": "leetcode",
    "event_type": "PushEvent",
    "timestamp": "2026-09-29T18:11:08+00:00",
    "repo": "shivansh-arch/LeetCode-Question",
    "message": "Diameter Of Binary Tree",
}

context = gather_context(item)
post = generate_post(item, context)

print("\n----- GENERATED POST -----")
print(post)

verdict = critique_post(post, item, context) # call critique_post with the right arguments

print("\n----- CRITIC VERDICT -----")
print(verdict)