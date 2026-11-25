const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const { encryptToken, decryptToken } = require("../lib/tokenCrypto");

const KEY = crypto.randomBytes(32).toString("base64");
const OTHER_KEY = crypto.randomBytes(32).toString("base64");
const TOKEN = "gho_exampleToken1234567890";

test("round trip returns the original token", () => {
    assert.equal(decryptToken(encryptToken(TOKEN, KEY), KEY), TOKEN);
});

test("stored value is versioned and never contains the token", () => {
    const stored = encryptToken(TOKEN, KEY);
    assert.match(stored, /^v1\.[^.]+\.[^.]+\.[^.]+$/);
    assert.ok(!stored.includes(TOKEN));
});

test("two encryptions of the same token differ (random IV)", () => {
    assert.notEqual(encryptToken(TOKEN, KEY), encryptToken(TOKEN, KEY));
});

test("tampered ciphertext is rejected", () => {
    const [v, iv, tag, data] = encryptToken(TOKEN, KEY).split(".");
    const flipped = Buffer.from(data, "base64");
    flipped[0] ^= 1;
    const tampered = [v, iv, tag, flipped.toString("base64")].join(".");
    assert.throws(() => decryptToken(tampered, KEY));
});

test("wrong key is rejected", () => {
    assert.throws(() => decryptToken(encryptToken(TOKEN, KEY), OTHER_KEY));
});

test("a key that is not 32 bytes is rejected", () => {
    const short = crypto.randomBytes(16).toString("base64");
    assert.throws(() => encryptToken(TOKEN, short), /32 bytes/);
});
