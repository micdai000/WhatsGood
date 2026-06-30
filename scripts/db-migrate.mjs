#!/usr/bin/env node
/**
 * Applies pending Supabase SQL migrations directly to the remote database.
 * Requires SUPABASE_DB_URL in .env.local (Database → Connection string → URI).
 */
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";
import { loadEnvLocal } from "./load-env.mjs";

loadEnvLocal();

const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ Missing SUPABASE_DB_URL in .env.local");
  console.error("");
  console.error("Add your database connection string from:");
  console.error("  Supabase Dashboard → Project Settings → Database → Connection string → URI");
  console.error("");
  console.error("Example:");
  console.error('  SUPABASE_DB_URL="postgresql://postgres.[ref]:[password]@aws-1-[region].pooler.supabase.com:5432/postgres"');
  console.error("");
  console.error("Tip: Use Session pooler (not Direct connection) if db.[ref].supabase.co fails with ENOTFOUND.");
  console.error("  Supabase Dashboard → Connect → Session pooler → URI");
  process.exit(1);
}

const migrationsDir = resolve(process.cwd(), "supabase/migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const sql = postgres(dbUrl, {
  ssl: "require",
  max: 1,
  onnotice: () => {},
});

try {
  await sql`CREATE SCHEMA IF NOT EXISTS supabase_migrations`;
  await sql`
    CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  const applied = await sql`
    SELECT version FROM supabase_migrations.schema_migrations
  `;
  const appliedSet = new Set(applied.map((row) => row.version));

  let ran = 0;

  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`⏭  ${file} (already applied)`);
      continue;
    }

    const contents = readFileSync(resolve(migrationsDir, file), "utf8");
    console.log(`▶  Applying ${file}...`);
    await sql.unsafe(contents);
    await sql`
      INSERT INTO supabase_migrations.schema_migrations (version)
      VALUES (${file})
      ON CONFLICT (version) DO NOTHING
    `;
    ran++;
    console.log(`✅ ${file}`);
  }

  if (ran === 0) {
    console.log("\nNo new migrations to apply.");
  } else {
    console.log(`\nApplied ${ran} migration(s).`);
  }
} finally {
  await sql.end();
}

console.log("\nVerifying onboarding prerequisites...");
await import("./db-verify.mjs");
