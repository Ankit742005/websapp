import { createClient } from "@libsql/client";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import "dotenv/config";

/**
 * Applies committed migrations to a remote libSQL/Turso database.
 *
 * `prisma migrate deploy` cannot do this itself — Prisma's migration engine
 * doesn't support the `libsql://` scheme (it's an HTTP-based protocol, not
 * one Prisma's engine understands), so it fails with P1013 "scheme not
 * recognized" against any Turso URL. The *runtime* driver adapter
 * (`@prisma/adapter-libsql`) has no such limitation — this script applies
 * each migration's raw SQL directly over that same libSQL HTTP protocol,
 * and records it in `_prisma_migrations` so the history stays legible.
 *
 * Usage: DATABASE_URL and DATABASE_AUTH_TOKEN must point at the remote
 * database (never a local `file:` — use `prisma migrate deploy` for that).
 *
 *   DATABASE_URL="libsql://..." DATABASE_AUTH_TOKEN="..." npm run db:deploy:turso
 */

const MIGRATIONS_DIR = join(process.cwd(), "prisma", "migrations");

function splitStatements(sql: string): string[] {
  return sql
    .split(";")
    .map((chunk) =>
      chunk
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter((stmt) => stmt.length > 0);
}

async function main() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (!url || !url.startsWith("libsql:")) {
    console.error(
      "DATABASE_URL must be a remote libsql:// URL. For a local file:// database, use `npm run db:deploy` instead.",
    );
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "checksum" TEXT NOT NULL,
      "finished_at" DATETIME,
      "migration_name" TEXT NOT NULL,
      "logs" TEXT,
      "rolled_back_at" DATETIME,
      "started_at" DATETIME NOT NULL DEFAULT current_timestamp,
      "applied_steps_count" INTEGER UNSIGNED NOT NULL DEFAULT 0
    )
  `);

  const applied = await client.execute(
    `SELECT migration_name FROM "_prisma_migrations"`,
  );
  const appliedNames = new Set(
    applied.rows.map((row) => row.migration_name as string),
  );

  const migrationDirs = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const dir of migrationDirs) {
    if (appliedNames.has(dir)) {
      console.log(`skip  ${dir} (already applied)`);
      continue;
    }

    const sqlPath = join(MIGRATIONS_DIR, dir, "migration.sql");
    const sql = readFileSync(sqlPath, "utf-8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const statements = splitStatements(sql);

    console.log(`apply ${dir} (${statements.length} statements)`);
    for (const stmt of statements) {
      await client.execute(stmt);
    }

    await client.execute({
      sql: `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, applied_steps_count) VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?)`,
      args: [randomUUID(), checksum, dir, statements.length],
    });
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Migration failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
