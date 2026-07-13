#!/usr/bin/env node
/**
 * Monthly badge computation entry point.
 * Invokes badgeService.computeBadgesForPeriod() for the current YYYY-MM
 * (or pass a period as the first argument).
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_URL in .env.local.
 */
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { loadEnvLocal } from "./load-env.mjs";

loadEnvLocal();

const result = spawnSync(
  "npx",
  [
    "vite-node",
    "--config",
    "vite.config.ts",
    resolve("src/scripts/compute-badges.ts"),
    ...process.argv.slice(2),
  ],
  {
    stdio: "inherit",
    shell: true,
    env: process.env,
    cwd: process.cwd(),
  },
);

process.exit(result.status ?? 1);
