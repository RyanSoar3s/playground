import type { ExecutionStatus } from "@models/response.model";

const runner = async (commands: string[], stdin?: string) => {
  const start = performance.now();

  const proc = Bun.spawn(commands, {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe"

  });

  let timedOut = false;

  if (stdin !== undefined) {
    await proc.stdin.write(stdin);
    
  }

  await proc.stdin.flush();
  await proc.stdin.end();

  const timeoutMs = 5000;

  const timeout = setTimeout(() => {
    timedOut = true;
    proc.kill();

  }, timeoutMs);

  await proc.exited;

  clearTimeout(timeout);

  const durationMs = performance.now() - start;

  const stdout = await proc.stdout.text();
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
