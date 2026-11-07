import express from "express";
import "dotenv/config";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initDatabase, pool } from "./server/db";
import listingsRouter from "./server/routes/listings";
import reviewsRouter from "./server/routes/reviews";
import authRouter from "./server/routes/auth";

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
    const requiredEnvironment = [
        "DATABASE_URL",
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
    ];
    const missingEnvironment = requiredEnvironment.filter(
        (name) => !process.env[name],
    );
    if (missingEnvironment.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingEnvironment.join(", ")}`,
        );
    }

    const app = express();

    // Parse incoming JSON and URL-encoded payloads
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use((req, res, next) => {
        const origin = process.env.CORS_ORIGIN;
        if (origin && req.headers.origin === origin) {
            res.setHeader("Access-Control-Allow-Origin", origin);
            res.setHeader("Vary", "Origin");
        }
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        if (req.method === "OPTIONS") {
            res.sendStatus(204);
            return;
        }
        next();
    });
    // Initialize the Supabase PostgreSQL database when requested.
    try {
        await initDatabase();
        console.log("Database initialized successfully.");
    } catch (err) {
        console.error("Failed to initialize database:", err);
        throw err;
    }

    // Request logger
    let reqCount = 1;
    app.use((req, res, next) => {
        if (req.originalUrl.startsWith("/api")) {
            console.log(`[#${reqCount++}] ${req.method} ${req.originalUrl}`);
        }
        next();
    });

    // API Routes
    app.use("/api/listings", listingsRouter);
    app.use("/api", reviewsRouter);
    app.use("/api", authRouter);

    // Health check endpoint
    app.get("/api/health", (req, res) => {
        res.json({
            status: "ok",
            app: "WanderSpace SQL + React",
            version: "1.0.0",
        });
    });

    // Vite middleware in development vs static serving in production
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), "dist");
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
            res.sendFile(path.join(distPath, "index.html"));
        });
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(
            `WanderSpace server is running at http://localhost:${PORT}`,
        );
    });
}

startServer().catch(async (error) => {
    console.error("Failed to start server:", error);
    await pool.end();
    process.exit(1);
});
