import express from "express";
import { queryOne } from "../db";
import { supabaseAdmin } from "../supabase";

const router = express.Router();

router.post("/auth/register", async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const username =
        typeof req.body?.username === "string" ? req.body.username.trim() : "";
    const password =
        typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !username || !password) {
        res.status(400).json({
            error: "Email, username, and password are required.",
        });
        return;
    }

    if (username.length < 3 || username.length > 100) {
        res.status(400).json({
            error: "Username must be between 3 and 100 characters.",
        });
        return;
    }

    try {
        const existingProfile = await queryOne<{ id: string }>(
            "SELECT id FROM profiles WHERE username = ? LIMIT 1",
            [username],
        );
        if (existingProfile) {
            res.status(409).json({
                error: "That username is already taken.",
            });
            return;
        }

        const { error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { username },
        });

        if (error) {
            const message = error.message || "";
            if (
                error.code === "email_exists" ||
                /email.*already|already.*email/i.test(message)
            ) {
                res.status(409).json({ error: "That email is already registered." });
                return;
            }
            if (/duplicate|username.*already|already.*username/i.test(message)) {
                res.status(409).json({ error: "That username is already taken." });
                return;
            }
            if (/invalid email/i.test(message)) {
                res.status(400).json({ error: "That email address is invalid." });
                return;
            }
            console.error("Failed to register user:", error);
            res.status(400).json({ error: "Unable to create your account." });
            return;
        }

        res.status(201).json({ registered: true });
    } catch (error) {
        console.error("Failed to register user:", error);
        res.status(500).json({ error: "Unable to create your account right now." });
    }
});

router.post("/auth/check-username", async (req, res) => {
    const username =
        typeof req.body?.username === "string" ? req.body.username.trim() : "";

    if (!username) {
        res.status(400).json({ error: "Username is required." });
        return;
    }

    try {
        const profile = await queryOne<{ id: string }>(
            "SELECT id FROM profiles WHERE username = ? LIMIT 1",
            [username],
        );
        if (profile) {
            res.status(409).json({
                available: false,
                error: "That username is already taken.",
            });
            return;
        }
        res.json({ available: true });
    } catch (error) {
        console.error("Failed to check username availability:", error);
        res.status(500).json({ error: "Unable to validate username right now." });
    }
});

router.post("/auth/resolve-username", async (req, res) => {
    const username =
        typeof req.body?.username === "string" ? req.body.username.trim() : "";

    if (!username) {
        res.status(400).json({ error: "Username is required." });
        return;
    }

    try {
        const profile = await queryOne<{ id: string }>(
            "SELECT id FROM profiles WHERE username = ?",
            [username],
        );
        if (!profile) {
            res.status(401).json({ error: "Invalid username or password." });
            return;
        }

        const { data, error } = await supabaseAdmin.auth.admin.getUserById(
            profile.id,
        );
        if (error || !data.user?.email) {
            console.error("Failed to resolve username for login:", error);
            res.status(401).json({ error: "Invalid username or password." });
            return;
        }

        res.json({ email: data.user.email });
    } catch (error) {
        console.error("Failed to resolve username for login:", error);
        res.status(500).json({ error: "Unable to process login right now." });
    }
});

export default router;
