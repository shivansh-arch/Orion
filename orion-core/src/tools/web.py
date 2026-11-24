import ipaddress
import socket
from urllib.parse import urljoin, urlparse

import requests
import trafilatura
from bs4 import BeautifulSoup

MAX_REDIRECTS = 5

# Sites like Wikipedia reject requests that have no User-Agent (403).
HEADERS = {"User-Agent": "OrionAgent/1.0 (learning project)"}


class BlockedURLError(Exception):
    pass


def _check_url_is_public(url):
    """Raise BlockedURLError unless every IP the URL's host resolves to is public."""
    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https"):
        raise BlockedURLError(f"only http/https URLs are allowed, got '{parsed.scheme}'")

    host = parsed.hostname
    if not host:
        raise BlockedURLError("URL has no host")

    port = parsed.port or (443 if parsed.scheme == "https" else 80)

    try:
        infos = socket.getaddrinfo(host, port, type=socket.SOCK_STREAM)
    except socket.gaierror:
        raise BlockedURLError(f"could not resolve host '{host}'")

    for info in infos:
        ip = ipaddress.ip_address(info[4][0].split("%")[0])
        if ip.version == 6 and ip.ipv4_mapped:
            ip = ip.ipv4_mapped
        # Covers loopback, private LAN, link-local (cloud metadata), CGNAT, reserved.
        if not ip.is_global:
            raise BlockedURLError(f"'{host}' points to a private/internal address ({ip})")


def _get_public(url):
    """GET a URL, re-checking the destination before every redirect hop."""
    for _ in range(MAX_REDIRECTS + 1):
        _check_url_is_public(url)
        response = requests.get(url, headers=HEADERS, timeout=10, allow_redirects=False)

        if response.is_redirect:
            url = urljoin(url, response.headers["Location"])
            continue

        response.raise_for_status()
        return response

    raise BlockedURLError(f"too many redirects (more than {MAX_REDIRECTS})")


def fetch_webpage(url):
    """
    Fetch a public webpage and return the main article text.
    Falls back to BeautifulSoup extraction if Trafilatura
    cannot identify the main content.
    """
    try:
        response = _get_public(url)

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

    except BlockedURLError as e:
        return f"Blocked: {e}. Only public websites can be fetched."

    except Exception as e:
        # NOTE:
        # This catches network errors, parsing errors,
        # and Trafilatura import/runtime errors alike.
        return f"Error fetching page: {e}"
