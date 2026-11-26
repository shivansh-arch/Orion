const mongoose = require("mongoose");

const githubConnectionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
        unique: true,
    },
    // GitHub's numeric id, not the login: logins can be renamed and reused.
    githubId: {
        type: Number,
        required: true,
        unique: true,
    },
    login: {
        type: String,
        required: true,
    },
    // AES-256-GCM, see lib/tokenCrypto.js. Never returned to the browser.
    tokenEncrypted: {
        type: String,
        required: true,
    },
    connectedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("GithubConnection", githubConnectionSchema, "github_connections");
