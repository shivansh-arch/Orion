const test = require("node:test");
const assert = require("node:assert/strict");

const {
    buildAuthorizeUrl,
    exchangeCode,
    fetchGithubUser,
    githubConfig,
} = require("../lib/githubOAuth");

function fakeFetch(body, status = 200) {
    const calls = [];
    const impl = async (url, options = {}) => {
        calls.push({ url, options });
        return {
            ok: status >= 200 && status < 300,
            status,
            json: async () => body,
        };
    };
    impl.calls = calls;
    return impl;
}

test("authorize URL carries client_id, redirect_uri and state, and no scope", () => {
    const url = new URL(buildAuthorizeUrl({
        clientId: "abc123",
        redirectUri: "http://localhost:5173/github/callback",
        state: "s-1",
    }));

    assert.equal(url.origin + url.pathname, "https://github.com/login/oauth/authorize");
    assert.equal(url.searchParams.get("client_id"), "abc123");
    assert.equal(url.searchParams.get("redirect_uri"), "http://localhost:5173/github/callback");
    assert.equal(url.searchParams.get("state"), "s-1");
    assert.equal(url.searchParams.has("scope"), false);
});

test("exchangeCode posts to GitHub and returns the access token", async () => {
    const fetchImpl = fakeFetch({ access_token: "gho_tok", token_type: "bearer" });
    const token = await exchangeCode({
        code: "code-1",
        clientId: "abc123",
        clientSecret: "secret",
        redirectUri: "http://localhost:5173/github/callback",
        fetchImpl,
    });

    assert.equal(token, "gho_tok");
    const [{ url, options }] = fetchImpl.calls;
    assert.equal(url, "https://github.com/login/oauth/access_token");
    assert.equal(options.method, "POST");
    assert.equal(options.headers.Accept, "application/json");
    assert.deepEqual(JSON.parse(options.body), {
        client_id: "abc123",
        client_secret: "secret",
        code: "code-1",
        redirect_uri: "http://localhost:5173/github/callback",
    });
});

test("exchangeCode rejects when GitHub returns an error", async () => {
    const fetchImpl = fakeFetch({ error: "bad_verification_code" });
    await assert.rejects(
        exchangeCode({ code: "x", clientId: "a", clientSecret: "b", redirectUri: "c", fetchImpl }),
        /bad_verification_code/,
    );
});

test("fetchGithubUser returns the numeric id and login", async () => {
    const fetchImpl = fakeFetch({ id: 42, login: "octocat", name: "Mona" });
    const user = await fetchGithubUser({ token: "gho_tok", fetchImpl });

    assert.deepEqual(user, { id: 42, login: "octocat" });
    const [{ url, options }] = fetchImpl.calls;
    assert.equal(url, "https://api.github.com/user");
    assert.equal(options.headers.Authorization, "Bearer gho_tok");
});

test("fetchGithubUser rejects on a non-2xx answer", async () => {
    await assert.rejects(fetchGithubUser({ token: "bad", fetchImpl: fakeFetch({}, 401) }), /401/);
});

test("githubConfig is null unless all three settings exist", () => {
    assert.equal(githubConfig({}), null);
    assert.equal(githubConfig({ GITHUB_CLIENT_ID: "a", GITHUB_CLIENT_SECRET: "b" }), null);
});

test("githubConfig defaults the redirect URI and allows overriding it", () => {
    const env = { GITHUB_CLIENT_ID: "a", GITHUB_CLIENT_SECRET: "b", GITHUB_TOKEN_KEY: "k" };
    assert.deepEqual(githubConfig(env), {
        clientId: "a",
        clientSecret: "b",
        tokenKey: "k",
        redirectUri: "http://localhost:5173/github/callback",
    });
    assert.equal(
        githubConfig({ ...env, GITHUB_REDIRECT_URI: "https://orion.example/github/callback" }).redirectUri,
        "https://orion.example/github/callback",
    );
});
