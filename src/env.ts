import { z } from "zod";

/**
 * Validate environment variables once, at boot, with Zod (§ "Zod on every
 * boundary — forms, API, env"). Fail fast with a readable message instead of
 * surfacing `undefined` deep inside a request. Server-only — never import from
 * a Client Component.
 */
const envSchema = z.object({
  // Database — SQLite `file:` URL locally, libSQL/Turso `libsql://` URL in prod.
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_AUTH_TOKEN: z.string().optional(),

  // Auth.js
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required (run: npx auth secret)"),
  AUTH_URL: z.string().url().optional(),

  // Optional OAuth providers — enabled only when both id + secret are present.
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),

  // Public
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  // Allow builds/CI to skip validation when secrets aren't present yet.
  if (process.env.SKIP_ENV_VALIDATION === "1") {
    return process.env as unknown as Env;
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "\n❌ Invalid environment variables:\n" + z.prettifyError(parsed.error) + "\n",
    );
    throw new Error("Invalid environment variables — see logs above.");
  }
  return parsed.data;
}

export const env = loadEnv();
