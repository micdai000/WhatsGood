#!/usr/bin/env node
/**
 * Verifies TrustLoop onboarding database prerequisites on the linked Supabase project.
 * Uses the public REST API (anon key) — no database password required.
 */
import { loadEnvLocal } from "./load-env.mjs";

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const headers = {
  apikey: anonKey,
  Authorization: `Bearer ${anonKey}`,
};

async function check(label, request) {
  const response = await fetch(request.url, { headers });
  const body = await response.json().catch(() => ({}));

  if (response.ok) {
    console.log(`✅ ${label}`);
    return true;
  }

  console.error(`❌ ${label}`);
  console.error(`   ${body.message ?? response.statusText}`);
  return false;
}

console.log(`Checking Supabase project: ${url}\n`);

const professionsOk = await check(
  "public.professions table exists and is readable",
  { url: `${url}/rest/v1/professions?select=id,name&limit=1` },
);

const profileColumnsOk = await check(
  "profiles.profession_id, city, state columns exist",
  { url: `${url}/rest/v1/profiles?select=profession_id,city,state&limit=0` },
);

const reviewsOk = await check(
  "public.reviews table exists and is readable",
  { url: `${url}/rest/v1/reviews?select=id&limit=0` },
);

const profileRatingsOk = await check(
  "profiles.average_rating, total_reviews columns exist",
  { url: `${url}/rest/v1/profiles?select=average_rating,total_reviews&limit=0` },
);

const reviewRequestsOk = await check(
  "public.review_requests table exists and is readable",
  { url: `${url}/rest/v1/review_requests?select=id&limit=0` },
);

if (professionsOk) {
  const countRes = await fetch(`${url}/rest/v1/professions?select=id`, {
    headers: { ...headers, Prefer: "count=exact" },
  });
  const count = countRes.headers.get("content-range")?.split("/")[1] ?? "?";
  console.log(`   → ${count} profession(s) seeded`);
}

console.log("");

if (!professionsOk || !profileColumnsOk || !reviewsOk || !profileRatingsOk || !reviewRequestsOk) {
  console.error("Onboarding database is NOT ready.");
  console.error("Run: npm run db:migrate");
  console.error("Or apply pending migrations in the Supabase SQL Editor.");
  process.exit(1);
}

console.log("Database prerequisites are satisfied.");
