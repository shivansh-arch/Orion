const AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const TOKEN_URL = "https://github.com/login/oauth/access_token";
const USER_URL = "https://api.github.com/user";
const DEFAULT_REDIRECT_URI = "http://localhost:5173/github/callback";
const USER_AGENT = "OrionAgent/1.0 (learning project)";

function githubConfig(env) {
    const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_TOKEN_KEY, GITHUB_REDIRECT_URI } = env;
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GITHUB_TOKEN_KEY) {
        return null;
    }
    return {
        clientId: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        tokenKey: GITHUB_TOKEN_KEY,
        redirectUri: GITHUB_REDIRECT_URI || DEFAULT_REDIRECT_URI,
    };
}

// No `scope` parameter: the token can only read public information.
function buildAuthorizeUrl({ clientId, redirectUri, state }) {
    const url = new URL(AUTHORIZE_URL);
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("allow_signup", "false");
    return url.toString();
}

async function exchangeCode({ code, clientId, clientSecret, redirectUri, fetchImpl = fetch }) {
    const response = await fetchImpl(TOKEN_URL, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT,
        },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectUri,
        }),
    });
    const body = await response.json();
    if (!response.ok || body.error || !body.access_token) {
        throw new Error(`GitHub token exchange failed: ${body.error || response.status}`);
    }
    return body.access_token;
}

async function fetchGithubUser({ token, fetchImpl = fetch }) {
    const response = await fetchImpl(USER_URL, {
        headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`,
            "User-Agent": USER_AGENT,
        },
    });
    if (!response.ok) {
        throw new Error(`GitHub user lookup failed: ${response.status}`);
    }
    const body = await response.json();
    return { id: body.id, login: body.login };
}

module.exports = { githubConfig, buildAuthorizeUrl, exchangeCode, fetchGithubUser };
