import { spawn } from "node:child_process";

export interface RunResult {
  code: number;
  stdout: string;
  stderr: string;
}

/** Run a command, captured. Throws with stderr context on non-zero exit. */
export function run(
  cmd: string,
  args: string[],
  opts: { allowFailure?: boolean; cwd?: string } = {},
): Promise<RunResult> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(cmd, args, { cwd: opts.cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d: Buffer) => (stdout += d.toString()));
    child.stderr.on("data", (d: Buffer) => (stderr += d.toString()));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0 && !opts.allowFailure) {
        reject(
          new Error(
            `${cmd} ${args.join(" ")} exited ${code}\n${stderr.slice(-2000)}`,
          ),
        );
      } else {
        resolvePromise({ code: code ?? -1, stdout, stderr });
      }
    });
  });
}
