require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const auth = require("./middleware/auth");
const authRoutes = require("./routes/auto");

const Conversation=require("./model/Conversation");
const Message=require("./model/Message");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
app.use(express.json());
app.use(cors());

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
const ORION_BACKEND_URL = process.env.ORION_BACKEND_URL || "http://127.0.0.1:8000";
const MAX_MESSAGE_LENGTH = 2000;
const ORION_TIMEOUT_MS = 120000;

function extractAssistantContent(payload) {
    if (typeof payload === "string") {
        return payload;
    }

    if (!payload || typeof payload !== "object") {
        return "";
    }

    const candidateValues = [
        payload.reply,
        payload.message,
        payload.content,
        payload.text,
        payload.answer,
        payload.response,
        payload.data?.reply,
        payload.data?.message,
        payload.data?.content,
        payload.data?.text,
        payload.data?.answer,
        payload.data?.response,
    ];

    for (const value of candidateValues) {
        if (typeof value === "string" && value.trim()) {
            return value;
        }

        if (value && typeof value === "object") {
            const nestedValue = extractAssistantContent(value);
            if (nestedValue) {
                return nestedValue;
            }
        }
    }

    return "";
}

// ---------- Conversation Endpoints ----------
app.get("/conversations", auth, async (req, res) => {
    try {
        const conversations = await Conversation.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .lean();
        res.json(conversations);
    } catch (err) {
        console.error("Error fetching conversations:", err);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.get("/conversations/:id/messages", auth, async (req, res) => {
    try {
        const conversationId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({ error: "Invalid conversationId format." });
        }

        const conversation = await Conversation.findOne({
            _id: conversationId,
            userId: req.user.id,
        });

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found or access denied." });
        }

        const messages = await Message.find({ conversationId })
            .sort({ timestamp: 1 })
            .lean();

        res.json(messages);
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.delete("/conversations/:id", auth, async (req, res) => {
    try {
        const conversationId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({ error: "Invalid conversationId format." });
        }

        const conversation = await Conversation.findOne({
            _id: conversationId,
            userId: req.user.id,
        });

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found or access denied." });
        }

        await Message.deleteMany({ conversationId });
        await Conversation.deleteOne({ _id: conversationId });

        res.json({ message: "Conversation deleted." });
    } catch (err) {
        console.error("Error deleting conversation:", err);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.post("/chat", auth, async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                error: "Unauthorized.",
                conversationId: null,
            });
        }

        const requestBody = req.body || {};
        const rawMessage = requestBody.message || requestBody.query;
        const incomingConversationId = requestBody.conversationId || requestBody.conversationID || requestBody.conversation_id;

        console.log("Incoming chat body:", requestBody);
        console.log("Conversation ID received:", incomingConversationId || "not provided");

        const userMessage = typeof rawMessage === "string" ? rawMessage.trim() : String(rawMessage || "").trim();

        if (!userMessage) {
            return res.status(400).json({
                error: "Message is required.",
                conversationId: null,
            });
        }

        if (userMessage.length > MAX_MESSAGE_LENGTH) {
            return res.status(413).json({
                error: "Message is too long.",
                conversationId: null,
            });
        }

        let currentConversationId = null;
        let currentConversation = null;

        if (incomingConversationId) {
            if (!mongoose.Types.ObjectId.isValid(incomingConversationId)) {
                return res.status(400).json({
                    error: "Invalid conversationId format.",
                    conversationId: null,
                });
            }

            currentConversation = await Conversation.findOne({
                _id: incomingConversationId,
                userId: req.user.id,
            });

            if (!currentConversation) {
                return res.status(404).json({
                    error: "Conversation not found or access denied.",
                    conversationId: null,
                });
            }

            currentConversationId = currentConversation._id;
        } else {
            const title = userMessage.slice(0, 40) || "New chat";
            currentConversation = await Conversation.create({
                userId: req.user.id,
                title,
            });

            currentConversationId = currentConversation._id;
        }

        const savedUserMessage = await Message.create({
            conversationId: currentConversationId,
            role: "user",
            content: userMessage,
        });

        const history = await Message.find({
            conversationId: currentConversationId,
            _id: { $ne: savedUserMessage._id },
        })
            .sort({ timestamp: -1 })
            .limit(20)
            .lean();
        const formattedHistory = history.reverse().map(({ role, content }) => ({ role, content }));

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), ORION_TIMEOUT_MS);

        let response;
        try {
            response = await fetch(`${ORION_BACKEND_URL}/agent/run`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: userMessage,
                    conversationId: currentConversationId.toString(),
                    history: formattedHistory,
                }),
                signal: controller.signal,
            });
        } catch (fetchErr) {
            clearTimeout(timeoutId);
            console.error("Orion backend request failed:", fetchErr);
            return res.status(504).json({
                error: "Timed out or could not reach Orion backend.",
                conversationId: currentConversationId.toString(),
            });
        } finally {
            clearTimeout(timeoutId);
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Orion backend error:", errorText);
            return res.status(502).json({
                error: "Unable to reach Orion backend.",
                conversationId: currentConversationId.toString(),
            });
        }

        const data = await response.json();
        const assistantContent = extractAssistantContent(data);

        if (assistantContent) {
            await Message.create(
                [{
                    conversationId: currentConversationId,
                    role: "assistant",
                    content: assistantContent,
                }]
            );
        }


        console.log("Authenticated User:", req.user.id);

        res.json({
            ...data,
            conversationId: currentConversationId.toString(),
        });
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({
                error: "Invalid conversationId format.",
                conversationId: null,
            });
        }

        if (err.name === "AbortError") {
            return res.status(504).json({
                error: "Timed out or could not reach Orion backend.",
                conversationId: null,
            });
        }

        console.error("Error communicating with Orion:", err);

        res.status(500).json({
            error: "Internal server error.",
            conversationId: null,
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