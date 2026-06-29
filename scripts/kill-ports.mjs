import { execSync } from "node:child_process";

const ports = [3000, 3001];

for (const port of ports) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, {
      encoding: "utf8",
      shell: true,
    });

    const pids = new Set();
    for (const line of out.split("\n")) {
      if (!line.includes("LISTENING")) continue;
      const pid = line.trim().split(/\s+/).pop();
      if (pid && pid !== "0") pids.add(pid);
    }

    for (const pid of pids) {
      execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore", shell: true });
    }
  } catch {
    // Port not in use.
  }
}
