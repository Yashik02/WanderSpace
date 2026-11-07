import fs from "node:fs/promises";
import path from "node:path";
import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
});

export async function initDatabase(): Promise<void> {
    if (process.env.AUTO_INIT_DB === "true") {
        await runSqlFile("schema.sql");
    }

    const { rows } = await pool.query<{ count: string }>(
        "SELECT COUNT(*) AS count FROM listings",
    );
    const listingCount = Number(rows[0]?.count ?? 0);

    if (listingCount === 0) {
        await seedDatabase();
    }
}

export async function seedDatabase(): Promise<void> {
    await runSqlFile("seeds.sql");
}

async function runSqlFile(fileName: string): Promise<void> {
    const filePath = path.join(process.cwd(), fileName);
    const sql = await fs.readFile(filePath, "utf8");
    await pool.query(sql);
}

function toPostgresPlaceholders(sql: string): string {
    let index = 0;
    return sql.replace(/\?/g, () => `$${++index}`);
}

export async function query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = [],
): Promise<T[]> {
    const result = await pool.query<T>(toPostgresPlaceholders(sql), params);
    return result.rows;
}

export async function queryOne<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = [],
): Promise<T | null> {
    const rows = await query<T>(sql, params);
    return rows[0] ?? null;
}

export async function run(
    sql: string,
    params: unknown[] = [],
): Promise<{ affectedRows: number }> {
    const result = await pool.query(toPostgresPlaceholders(sql), params);
    return { affectedRows: result.rowCount ?? 0 };
}
