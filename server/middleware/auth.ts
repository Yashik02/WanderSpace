import { createClient } from "@supabase/supabase-js";
import type { NextFunction, Request, Response } from "express";
import "dotenv/config";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const header = req.header("Authorization");
    const token = header?.startsWith("Bearer ")
        ? header.slice("Bearer ".length)
        : null;

    if (!token) {
        res.status(401).json({ error: "Authentication required." });
        return;
    }

    try {
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) {
            res.status(401).json({ error: "Invalid or expired authentication token." });
            return;
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, username")
            .eq("id", data.user.id)
            .maybeSingle();

        if (profileError) {
            console.error("Failed to load authenticated profile:", profileError);
            res.status(500).json({ error: "Failed to load authenticated user." });
            return;
        }

        req.user = {
            id: data.user.id,
            username:
                profile?.username ??
                data.user.user_metadata.username ??
                data.user.email ??
                data.user.id,
        };
        next();
    } catch (error) {
        console.error("Failed to verify authentication token:", error);
        res.status(401).json({ error: "Invalid or expired authentication token." });
    }
}
