import requests

def search_wikipedia(query):
    """
    Search Wikipedia for a given query and return the summary of the first result.

    Args:
        query (str): The search query.
        
        """
    query = query.replace(" ", "_")  # Replace spaces with underscores for the URL
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{query}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        title=data.get("title", query)
        extract=data.get("extract", "No summary available.")
        return f"Title: {title}\nSummary: {extract}"
    else:
        return "Error: Unable to fetch data from Wikipedia."    