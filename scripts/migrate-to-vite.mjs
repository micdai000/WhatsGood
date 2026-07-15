import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "src");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const replacements = [
  [/^\s*"use client";\s*\n/gm, ""],
  [/^\s*'use client';\s*\n/gm, ""],
  [/import Link from "next\/link";/g, 'import { Link } from "react-router-dom";'],
  [/import Image from "next\/image";/g, 'import { AppImage } from "@/components/ui/app-image";'],
  [/<Image\b/g, "<AppImage"],
  [/<\/Image>/g, "</AppImage>"],
  [/import \{ useRouter \} from "next\/navigation";/g, 'import { useNavigate } from "react-router-dom";'],
  [/import \{ usePathname \} from "next\/navigation";/g, 'import { useLocation } from "react-router-dom";'],
  [/import \{ useSearchParams \} from "next\/navigation";/g, 'import { useSearchParams } from "react-router-dom";'],
  [/import \{ useParams \} from "next\/navigation";/g, 'import { useParams } from "react-router-dom";'],
  [/import \{ redirect \} from "next\/navigation";/g, 'import { Navigate } from "react-router-dom";'],
  [/import \{ notFound \} from "next\/navigation";/g, 'import { Navigate } from "react-router-dom";'],
  [/import dynamic from "next\/dynamic";/g, 'import { lazy, Suspense } from "react";'],
  [/import \{ createClient \} from "@\/lib\/supabase\/server";/g, 'import { createClient } from "@/lib/supabase/client";'],
  [/import "server-only";\s*\n/g, ""],
  [/export const dynamic = "force-dynamic";\s*\n/g, ""],
  [/const router = useRouter\(\);/g, "const navigate = useNavigate();"],
  [/const pathname = usePathname\(\);/g, "const { pathname } = useLocation();"],
  [/router\.push\(/g, "navigate("],
  [/router\.replace\(/g, "navigate("],
  [/<Link href=/g, "<Link to="],
  [/process\.env\.NEXT_PUBLIC_SUPABASE_URL/g, "import.meta.env.NEXT_PUBLIC_SUPABASE_URL"],
  [/process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY/g, "import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  [/process\.env\.NEXT_PUBLIC_SITE_URL/g, "import.meta.env.NEXT_PUBLIC_SITE_URL"],
];

const skipFiles = new Set([
  path.join(root, "middleware.ts"),
  path.join(root, "lib", "supabase", "server.ts"),
  path.join(root, "lib", "supabase", "middleware.ts"),
  path.join(root, "app", "auth", "callback", "route.ts"),
  path.join(root, "app", "layout.tsx"),
  path.join(root, "app", "sitemap.ts"),
  path.join(root, "app", "robots.ts"),
  path.join(root, "instrumentation.ts"),
]);

for (const file of walk(root)) {
  if (skipFiles.has(file)) continue;
  let content = fs.readFileSync(file, "utf8");
  const original = content;

  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }

  content = content.replace(
    /await this\.getClient\(\)/g,
    "this.getClient()",
  );
  content = content.replace(
    /const supabase = await createClient\(\)/g,
    "const supabase = createClient()",
  );
  content = content.replace(
    /private async getClient\(\): Promise<SupabaseClient>/g,
    "private getClient(): SupabaseClient",
  );

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log("updated", path.relative(process.cwd(), file));
  }
}

console.log("migration complete");
