from exa_py import Exa
import requests
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("EXA_API_KEY")
exa = Exa(api_key=api_key)


def deep_search(query):
    """
    Perform a web search using Exa.
    """
    results = exa.search(
        query,
        num_results=3,
        use_autoprompt=True
    )

    output = []

    for result in results.results:
        output.append(
            f"Title: {result.title}\n"
            f"URL: {result.url}\n"
            f"Snippet: {result.text}\n"
        )

    return "\n" + ("-" * 60 + "\n").join(output)


def simple_search(query):
    """
    Fallback to Wikipedia summary.
    """
    url = (
        "https://en.wikipedia.org/api/rest_v1/page/summary/"
        f"{query.replace(' ', '_')}"
    )

    response = requests.get(url, timeout=10)

    if response.status_code != 200:
        return "No Wikipedia article found."

    data = response.json()

    return data.get("extract", "No summary available.")


def search(query, deep=True):
    if deep:
        try:
            return deep_search(query)
        except Exception:
            return simple_search(query)

    return simple_search(query)


if __name__ == "__main__":
    print(search("Large Language Models"))