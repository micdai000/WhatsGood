import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

if (existsSync(".next")) {
  try {
    // Junctions must be removed with rmdir, not rm -rf.
    execSync("cmd /c rmdir .next", { stdio: "ignore" });
  } catch {
    rmSync(".next", { recursive: true, force: true });
  }
}

const legacyCache = join(
  process.env.LOCALAPPDATA ?? tmpdir(),
  "meritt-next-cache",
);
rmSync(legacyCache, { recursive: true, force: true });

mkdirSync(".next", { recursive: true });

// Pin .next locally so OneDrive is less likely to evict build files mid-compile.
try {
  execSync("attrib +P -U .next /S /D", { stdio: "ignore", shell: true });
} catch {
  // attrib is best-effort on non-OneDrive paths.
}

console.log("Cleared and prepared .next build cache");
