from exa_py import Exa
import requests
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("EXA_API_KEY")

if not api_key:
    raise ValueError("EXA_API_KEY not found in .env")

exa = Exa(api_key=api_key)

HEADERS = {
    "User-Agent": "OrionAgent/1.0 (learning project)"
}


def deep_search(query):
    """
    Perform a web search using Exa and return the top results.
    """
    results = exa.search_and_contents(
        query,
        num_results=3,
        text={"max_characters": 500}
    )

    if not results.results:
        return "No search results found."

    output = []

    for result in results.results:
        output.append(
            f"Title: {result.title}\n"
            f"URL: {result.url}\n"
            f"Content:\n{result.text}\n"
        )

    return "\n" + ("-" * 60 + "\n").join(output)


def simple_search(query):
    """
    Search Wikipedia and return the summary of the best matching page.
    """
    try:
        search_url = "https://en.wikipedia.org/w/api.php"

        params = {
            "action": "query",
            "list": "search",
            "srsearch": query,
            "format": "json"
        }

        response = requests.get(
            search_url,
            params=params,
            headers=HEADERS,
            timeout=10
        )
        response.raise_for_status()

        results = response.json()["query"]["search"]

        if not results:
            return "No Wikipedia article found."

        title = results[0]["title"]

        summary_url = (
            "https://en.wikipedia.org/api/rest_v1/page/summary/"
            f"{title.replace(' ', '_')}"
        )

        summary_response = requests.get(
            summary_url,
            headers=HEADERS,
            timeout=10
        )
        summary_response.raise_for_status()

        data = summary_response.json()

        return (
            f"Title: {title}\n\n"
            f"{data.get('extract', 'No summary available.')}"
        )

    except Exception as e:
        return f"Wikipedia error: {e}"


def search(query, deep=True):
    """
    Try Exa first; fall back to Wikipedia if Exa fails.
    """
    if deep:
        try:
            return deep_search(query)
        except Exception as e:
            print(f"Exa error: {e}")
            print("Falling back to Wikipedia...\n")
            return simple_search(query)

    return simple_search(query)


if __name__ == "__main__":
    query = input("Enter your search query: ")
    print(search(query))