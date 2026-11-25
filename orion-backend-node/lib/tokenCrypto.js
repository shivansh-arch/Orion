const crypto = require("node:crypto");

const VERSION = "v1";
const IV_BYTES = 12;

function loadKey(keyB64) {
    const key = Buffer.from(keyB64 || "", "base64");
    if (key.length !== 32) {
        throw new Error("GITHUB_TOKEN_KEY must be 32 bytes, base64-encoded.");
    }
    return key;
}

// Stored as v1.<iv>.<auth tag>.<ciphertext>, all base64.
function encryptToken(plain, keyB64) {
    const iv = crypto.randomBytes(IV_BYTES);
    const cipher = crypto.createCipheriv("aes-256-gcm", loadKey(keyB64), iv);
    const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [VERSION, iv, tag, data].map((part) => (Buffer.isBuffer(part) ? part.toString("base64") : part)).join(".");
}

function decryptToken(stored, keyB64) {
    const [version, iv, tag, data] = String(stored).split(".");
    if (version !== VERSION || !iv || !tag || !data) {
        throw new Error("Unrecognised encrypted token format.");
    }
    const decipher = crypto.createDecipheriv("aes-256-gcm", loadKey(keyB64), Buffer.from(iv, "base64"));
    decipher.setAuthTag(Buffer.from(tag, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
}

module.exports = { encryptToken, decryptToken };
