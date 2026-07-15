import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "src");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

for (const file of walk(root)) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;

  if (content.includes('from "react-router-dom"') && content.includes("Link")) {
    content = content.replace(/(<Link[^>]*?)\shref=/g, "$1 to=");
  }

  content = content.replace(/^"use server";\s*\n/gm, "");
  content = content.replace(/import \{ revalidatePath \} from "next\/cache";\s*\n/g, "");
  content = content.replace(/\s*revalidatePath\([^)]+\);\s*\n/g, "\n");

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log("fixed", path.relative(process.cwd(), file));
  }
}

console.log("fix pass complete");
