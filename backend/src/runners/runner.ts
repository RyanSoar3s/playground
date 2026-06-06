import type { ExecutionStatus } from "@models/response.model";
import readStreamWithLimit from "@utils/read-stream.util";

const runner = async (commands: { start: string[], kill: string[] }, stdin?: string) => {
  const start = performance.now();

  const proc = Bun.spawn(commands.start, {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe"

  });

  let timedOut = false;

  if (stdin) {
    await proc.stdin.write(stdin);

  }

  await proc.stdin.flush();
  await proc.stdin.end();

  const timeoutMs = 5000;

  const timeout = setTimeout(() => {
    timedOut = true;
    Bun.spawn(commands.kill);

  }, timeoutMs);

  await proc.exited;

  clearTimeout(timeout);

  const durationMs = Number((performance.now() - start).toFixed(2));

  const stdout = await readStreamWithLimit(proc.stdout);
  const stderr = await proc.stderr.text();

  const exitCode = proc.exitCode;

  const status = (
    (timedOut) ? "timeout" :
    (exitCode === 0) ? "success" : "error"

  ) as ExecutionStatus;

  return {
    status,
    stdout,
    stderr,
    exitCode,
    durationMs

  }

};

export default runner;
