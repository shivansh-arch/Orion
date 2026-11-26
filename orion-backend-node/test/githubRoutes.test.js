const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const { createGithubRouter, PYTHON_COLLECTIONS } = require("../routes/github");
const GithubConnection = require("../model/GithubConnection");
const OAuthState = require("../model/OAuthState");
const { decryptToken } = require("../lib/tokenCrypto");

process.env.JWT_SECRET = "test-secret";
const TEST_DB = process.env.MONGO_TEST_URI || "mongodb://127.0.0.1:27017/orion_test";

const config = {
    clientId: "client-1",
    clientSecret: "secret-1",
    tokenKey: crypto.randomBytes(32).toString("base64"),
    redirectUri: "http://localhost:5173/github/callback",
};

const userA = new mongoose.Types.ObjectId();
const userB = new mongoose.Types.ObjectId();
const tokenFor = (id) => jwt.sign({ id: id.toString(), email: "x@orion.local" }, process.env.JWT_SECRET);

// Fake GitHub: each code maps to the GitHub user it logs in as.
const githubUsers = { "code-a": { id: 101, login: "alice" }, "code-a2": { id: 102, login: "alice-alt" } };
async function fakeGithub(url, options = {}) {
    if (url === "https://github.com/login/oauth/access_token") {
        const { code } = JSON.parse(options.body);
        const body = githubUsers[code] ? { access_token: `tok-${code}` } : { error: "bad_verification_code" };
        return { ok: true, status: 200, json: async () => body };
    }
    if (url === "https://api.github.com/user") {
        const code = options.headers.Authorization.replace("Bearer tok-", "");
        return { ok: true, status: 200, json: async () => githubUsers[code] };
    }
    throw new Error(`unexpected URL ${url}`);
}

let server;
let base;

function startApp(routerConfig) {
    const app = express();
    app.use(express.json());
    app.use("/github", createGithubRouter({ config: routerConfig, fetchImpl: fakeGithub }));
    return new Promise((resolve) => {
        const s = app.listen(0, () => resolve(s));
    });
}

async function call(method, path, { user, baseUrl = base } = {}) {
    const headers = user ? { Authorization: `Bearer ${tokenFor(user)}` } : {};
    return fetch(`${baseUrl}${path}`, { method, headers, redirect: "manual" });
}

async function connectAs(user, code) {
    const { url } = await (await call("POST", "/github/connect", { user })).json();
    const state = new URL(url).searchParams.get("state");
    const res = await call("GET", `/github/callback?code=${code}&state=${state}`);
    return { res, state };
}

test.before(async () => {
    await mongoose.connect(TEST_DB);
    server = await startApp(config);
    base = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    server.close();
});

test.beforeEach(async () => {
    await mongoose.connection.dropDatabase();
    await GithubConnection.syncIndexes();
    await OAuthState.syncIndexes();
});

test("every route answers 503 when GitHub is not configured", async () => {
    const s = await startApp(null);
    const url = `http://127.0.0.1:${s.address().port}`;
    for (const [method, path] of [["POST", "/github/connect"], ["GET", "/github/callback"], ["GET", "/github/status"], ["DELETE", "/github/connection"]]) {
        const res = await call(method, path, { user: userA, baseUrl: url });
        assert.equal(res.status, 503, `${method} ${path}`);
        assert.deepEqual(await res.json(), { error: "GitHub is not configured." });
    }
    s.close();
});

test("connect requires a login", async () => {
    assert.equal((await call("POST", "/github/connect")).status, 401);
});

test("connect returns a no-scope GitHub URL whose state is stored for the user", async () => {
    const { url } = await (await call("POST", "/github/connect", { user: userA })).json();
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.has("scope"), false);
    const saved = await OAuthState.findOne({ state: parsed.searchParams.get("state") });
    assert.equal(saved.userId.toString(), userA.toString());
    assert.ok(saved.expiresAt > new Date(Date.now() + 9 * 60 * 1000));
});

test("a valid callback stores an encrypted token and lands on the profile page", async () => {
    const { res, state } = await connectAs(userA, "code-a");

    assert.equal(res.status, 302);
    assert.equal(res.headers.get("location"), "/#/profile");
    const conn = await GithubConnection.findOne({ userId: userA });
    assert.equal(conn.githubId, 101);
    assert.equal(conn.login, "alice");
    assert.match(conn.tokenEncrypted, /^v1\./);
    assert.ok(!conn.tokenEncrypted.includes("tok-code-a"));
    assert.equal(decryptToken(conn.tokenEncrypted, config.tokenKey), "tok-code-a");
    assert.equal(await OAuthState.countDocuments({ state }), 0);
});

test("a reused state is refused", async () => {
    const { state } = await connectAs(userA, "code-a");
    await GithubConnection.deleteMany({});
    const res = await call("GET", `/github/callback?code=code-a&state=${state}`);
    assert.equal(res.headers.get("location"), "/#/settings?github=error");
    assert.equal(await GithubConnection.countDocuments(), 0);
});

test("an unknown state is refused and stores nothing", async () => {
    const res = await call("GET", "/github/callback?code=code-a&state=made-up");
    assert.equal(res.headers.get("location"), "/#/settings?github=error");
    assert.equal(await GithubConnection.countDocuments(), 0);
});

test("an expired state is refused", async () => {
    const { url } = await (await call("POST", "/github/connect", { user: userA })).json();
    const state = new URL(url).searchParams.get("state");
    await OAuthState.updateOne({ state }, { expiresAt: new Date(Date.now() - 1000) });
    const res = await call("GET", `/github/callback?code=code-a&state=${state}`);
    assert.equal(res.headers.get("location"), "/#/settings?github=error");
    assert.equal(await GithubConnection.countDocuments(), 0);
});

test("a bad code or missing parameters are refused", async () => {
    const { url } = await (await call("POST", "/github/connect", { user: userA })).json();
    const state = new URL(url).searchParams.get("state");
    assert.equal((await call("GET", `/github/callback?code=wrong&state=${state}`)).headers.get("location"), "/#/settings?github=error");
    assert.equal((await call("GET", "/github/callback")).headers.get("location"), "/#/settings?github=error");
    assert.equal(await GithubConnection.countDocuments(), 0);
});

test("a second Orion user cannot connect a GitHub account that is already linked", async () => {
    await connectAs(userA, "code-a");
    const { res } = await connectAs(userB, "code-a");
    assert.equal(res.headers.get("location"), "/#/settings?github=error");
    assert.equal(await GithubConnection.countDocuments({ userId: userB }), 0);
    assert.equal((await GithubConnection.findOne({ userId: userA })).login, "alice");
});

async function seedPythonData(userId) {
    for (const name of PYTHON_COLLECTIONS) {
        await mongoose.connection.db.collection(name).insertOne({ userId: userId.toString(), seeded: true });
    }
}

async function countPythonData(userId) {
    let total = 0;
    for (const name of PYTHON_COLLECTIONS) {
        total += await mongoose.connection.db.collection(name).countDocuments({ userId: userId.toString() });
    }
    return total;
}

test("disconnect removes the connection and all synced data for that user only", async () => {
    await connectAs(userA, "code-a");
    await seedPythonData(userA);
    await seedPythonData(userB);

    const res = await call("DELETE", "/github/connection", { user: userA });
    assert.deepEqual(await res.json(), { ok: true });
    assert.equal(await GithubConnection.countDocuments({ userId: userA }), 0);
    assert.equal(await countPythonData(userA), 0);
    assert.equal(await countPythonData(userB), PYTHON_COLLECTIONS.length);
});

test("reconnecting with a different GitHub account clears the old account's data", async () => {
    await connectAs(userA, "code-a");
    await seedPythonData(userA);
    await connectAs(userA, "code-a2");

    assert.equal((await GithubConnection.findOne({ userId: userA })).login, "alice-alt");
    assert.equal(await countPythonData(userA), 0);
});

test("status reports whether the user is connected", async () => {
    assert.deepEqual(await (await call("GET", "/github/status", { user: userA })).json(), { connected: false });
    await connectAs(userA, "code-a");
    assert.deepEqual(await (await call("GET", "/github/status", { user: userA })).json(), { connected: true, login: "alice" });
});
