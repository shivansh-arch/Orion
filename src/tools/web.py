import requests
from bs4 import BeautifulSoup

def fetch_webpage(url):
    """
    Fetch a webpage, remove HTML tags, and return clean text.
    """
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, "html.parser")

        # Remove unwanted elements
        for tag in soup(["script", "style"]):
            tag.decompose()

        # Extract clean text
        text = soup.get_text(separator=" ", strip=True)

        # Return first 2000 characters
        return text[:2000]

    except Exception as e:
        return f"Error fetching page: {e}"