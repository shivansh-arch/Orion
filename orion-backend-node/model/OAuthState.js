const mongoose = require("mongoose");

const oauthStateSchema = new mongoose.Schema({
    state: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    // MongoDB's TTL sweep runs about once a minute, so the callback also checks this itself.
    expiresAt: {
        type: Date,
        required: true,
        expires: 0,
    },
});

module.exports = mongoose.model("OAuthState", oauthStateSchema, "oauth_states");
