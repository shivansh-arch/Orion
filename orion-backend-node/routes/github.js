const crypto = require("node:crypto");
const express = require("express");
const mongoose = require("mongoose");

const auth = require("../middleware/auth");
const GithubConnection = require("../model/GithubConnection");
const OAuthState = require("../model/OAuthState");
const { buildAuthorizeUrl, exchangeCode, fetchGithubUser } = require("../lib/githubOAuth");
const { encryptToken } = require("../lib/tokenCrypto");

const STATE_TTL_MS = 10 * 60 * 1000;
const SUCCESS_REDIRECT = "/#/profile";
const ERROR_REDIRECT = "/#/settings?github=error";

// Written by the Python API, keyed by the user id as a string.
const PYTHON_COLLECTIONS = ["github_syncs", "github_repos", "github_commits", "developer_profiles", "mentor_sessions"];

async function purgeSyncedData(userId) {
    const db = mongoose.connection.db;
    await Promise.all(
        PYTHON_COLLECTIONS.map((name) => db.collection(name).deleteMany({ userId: userId.toString() })),
    );
}

function createGithubRouter({ config, fetchImpl = fetch }) {
    const router = express.Router();

    router.use((req, res, next) => {
        if (!config) {
            return res.status(503).json({ error: "GitHub is not configured." });
        }
        next();
    });

    router.post("/connect", auth, async (req, res) => {
        try {
            const state = crypto.randomBytes(32).toString("base64url");
            await OAuthState.create({
                state,
                userId: req.user.id,
                expiresAt: new Date(Date.now() + STATE_TTL_MS),
            });
            res.json({ url: buildAuthorizeUrl({ clientId: config.clientId, redirectUri: config.redirectUri, state }) });
        } catch (err) {
            console.error(`github connect failed user=${req.user.id} reason=${err.message}`);
            res.status(500).json({ error: "Internal server error." });
        }
    });

    // A plain browser redirect from GitHub: there is no JWT here, so the
    // single-use `state` is the only thing that ties it to an Orion user.
    router.get("/callback", async (req, res) => {
        const { code, state } = req.query;
        let userId = "unknown";

        try {
            if (typeof code !== "string" || typeof state !== "string" || !code || !state) {
                throw new Error("missing code or state");
            }

            const saved = await OAuthState.findOneAndDelete({ state });
            if (!saved || saved.expiresAt < new Date()) {
                throw new Error("unknown or expired state");
            }
            userId = saved.userId;

            const token = await exchangeCode({
                code,
                clientId: config.clientId,
                clientSecret: config.clientSecret,
                redirectUri: config.redirectUri,
                fetchImpl,
            });
            const githubUser = await fetchGithubUser({ token, fetchImpl });

            const owner = await GithubConnection.findOne({ githubId: githubUser.id });
            if (owner && owner.userId.toString() !== userId.toString()) {
                throw new Error("GitHub account already linked to another user");
            }

            const previous = await GithubConnection.findOne({ userId });
            if (previous && previous.githubId !== githubUser.id) {
                await purgeSyncedData(userId);
            }

            await GithubConnection.findOneAndUpdate(
                { userId },
                {
                    githubId: githubUser.id,
                    login: githubUser.login,
                    tokenEncrypted: encryptToken(token, config.tokenKey),
                    connectedAt: new Date(),
                },
                { upsert: true },
            );

            res.redirect(SUCCESS_REDIRECT);
        } catch (err) {
            console.error(`github callback failed user=${userId} reason=${err.message}`);
            res.redirect(ERROR_REDIRECT);
        }
    });

    router.get("/status", auth, async (req, res) => {
        try {
            const conn = await GithubConnection.findOne({ userId: req.user.id }).lean();
            res.json(conn ? { connected: true, login: conn.login } : { connected: false });
        } catch (err) {
            console.error(`github status failed user=${req.user.id} reason=${err.message}`);
            res.status(500).json({ error: "Internal server error." });
        }
    });

    router.delete("/connection", auth, async (req, res) => {
        try {
            await GithubConnection.deleteOne({ userId: req.user.id });
            await purgeSyncedData(req.user.id);
            res.json({ ok: true });
        } catch (err) {
            console.error(`github disconnect failed user=${req.user.id} reason=${err.message}`);
            res.status(500).json({ error: "Internal server error." });
        }
    });

    return router;
}

module.exports = { createGithubRouter, PYTHON_COLLECTIONS };
