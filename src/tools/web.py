import requests
import trafilatura
from bs4 import BeautifulSoup


def fetch_webpage(url):
    """
    Fetch a webpage and return the main article text.
    Falls back to BeautifulSoup extraction if Trafilatura
    cannot identify the main content.
    """
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        # Try content-aware extraction first
        text = trafilatura.extract(response.text)

        # Fallback if no main content could be extracted
        if text is None:
            soup = BeautifulSoup(response.text, "html.parser")

            for tag in soup(["script", "style"]):
                tag.decompose()

            text = soup.get_text(separator=" ", strip=True)

        # Intentional token-budget limit
        return text[:2000]

    except Exception as e:
        # NOTE:
        # This catches network errors, parsing errors,
        # and Trafilatura import/runtime errors alike.
        return f"Error fetching page: {e}"