const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../model/User");

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// bcrypt ignores everything after 72 bytes, so longer passwords would silently match on their prefix.
const MAX_PASSWORD_BYTES = 72;

function readCredentials(body) {
    const { email, password } = body || {};
    // Strings only: an object like {"$ne": null} would be run as a MongoDB query operator.
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
        return null;
    }
    return { email: email.trim().toLowerCase(), password };
}

function passwordProblem(password) {
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) return "Password must be at most 72 bytes.";
    if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter.";
    if (!/[0-9]/.test(password)) return "Password must include a number.";
    if (!/[^A-Za-z0-9]/.test(password)) return "Password must include a symbol.";
    return null;
}


// POST /signup
router.post("/signup", async (req, res) => {
    try {
        const credentials = readCredentials(req.body);

        if (!credentials) {
            return res.status(400).json({
                error: "Email and password are required.",
            });
        }

        const { email, password } = credentials;

        if (!EMAIL_PATTERN.test(email)) {
            return res.status(400).json({
                error: "Please enter a valid email address.",
            });
        }

        const problem = passwordProblem(password);
        if (problem) {
            return res.status(400).json({ error: problem });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                error: "User already exists.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            message: "User created successfully.",
            userId: user._id,
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Internal server error.",
        });
    }
});


// POST /login
router.post("/login", async (req, res) => {
    try {
        const credentials = readCredentials(req.body);

        if (!credentials) {
            return res.status(400).json({
                error: "Email and password are required.",
            });
        }

        const { email, password } = credentials;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password.",
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {
            return res.status(401).json({
                error: "Invalid email or password.",
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.json({
            message: "Login successful.",
            token,
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Internal server error.",
        });
    }
});

module.exports = router;