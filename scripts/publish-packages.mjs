import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const publishDirectories = [
  join(repoRoot, "apps/cli/publish"),
  join(repoRoot, "apps/mcp/publish"),
];
const extraArgs = process.argv.slice(2);

for (const publishDirectory of publishDirectories) {
  await runCommand("npm", ["publish", "--access", "public", ...extraArgs], {
    cwd: publishDirectory,
  });
}

function runCommand(command, args, options) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      ...options,
      stdio: "inherit",
    });

    child.on("error", rejectPromise);
    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(new Error(`${command} ${args.join(" ")} exited with code ${code ?? "unknown"}.`));
    });
  });
}
