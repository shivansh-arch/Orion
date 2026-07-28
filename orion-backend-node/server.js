require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const auth = require("./middleware/auth");
const authRoutes = require("./routes/auto");

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
app.use(express.json());

// ---------- Environment Checks ----------
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is missing.");
}

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is missing.");
}

// ---------- MongoDB ----------
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
    })
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });

// ---------- Routes ----------
app.use("/auth", authRoutes);

// ---------- Protected Chat Route ----------
app.post("/chat", auth, async (req, res) => {
    try {
        const userMessage = req.body.message;

        const response = await fetch("http://127.0.0.1:8000/agent/run", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: userMessage,
            }),
        });

        const data = await response.json();

        console.log("Authenticated User:", req.user.id);

        res.json(data);
    } catch (err) {
        console.error("Error communicating with Orion:", err);

        res.status(502).json({
            error: "Unable to reach Orion backend.",
        });
    }
});

// ---------- Health Check ----------
app.get("/", (req, res) => {
    res.json({
        message: "Orion Backend is running.",
    });
});

// ---------- Server ----------
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});