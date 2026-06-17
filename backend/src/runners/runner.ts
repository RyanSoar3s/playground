import type { ExecutionStatus } from "@models/response.model";
import type { RunnerCommands, RunnerOutputStream, RunnerCallbacks, BufferedOutput, RunnerResult } from "@models/runner.model";

const OUTPUT_LIMIT_BYTES = 50000;
const IDLE_INPUT_REQUEST_MS = 1000;
const INPUT_TIMEOUT_MS = 10000;
const HARD_TIMEOUT_MS = 30000;

export default class Runner {
  private proc?: Bun.Subprocess<"pipe", "pipe", "pipe">;
  private waitingForInput = false;
  private timedOut = false;
  private cancelled = false;
  private idleTimeout?: Timer;
  private inputTimeout?: Timer;
  private hardTimeout?: Timer;

  constructor(
    private readonly commands: RunnerCommands,
    private readonly callbacks: RunnerCallbacks = {}

  ) {}

  async execute(): Promise<RunnerResult> {
    const start = performance.now();

    this.proc = Bun.spawn(this.commands.start, {
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe"

    });

    this.scheduleIdleTimeout();
    this.hardTimeout = setTimeout(() => this.timeout(), HARD_TIMEOUT_MS);

    const stdout = await this.readStream(this.proc.stdout, "stdout");
    const stderr = await this.readStream(this.proc.stderr, "stderr");

    await this.proc.exited;

    this.clearTimers();

    const durationMs = Number((performance.now() - start).toFixed(0));
    const exitCode = this.proc.exitCode;

    const status = (
      (this.timedOut) ? "timeout" :
      (this.cancelled) ? "error" :
      (exitCode === 0) ? "success" : "error"

    ) as ExecutionStatus;

    return {
      status,
      stdout,
      stderr: stderr.text,
      exitCode,
      durationMs

    };

  }

  async writeStdin(value: string): Promise<void> {
    if (!this.proc) return;

    this.waitingForInput = false;
    this.clearInputTimeout();
    this.scheduleIdleTimeout();

    await this.proc.stdin.write(value.endsWith("\n") ? value : `${value}\n`);
    await this.proc.stdin.flush();

  }

  cancel(): void {
    this.cancelled = true;
    this.kill();

  }

  private async readStream(
    stream: ReadableStream<Uint8Array>,
    streamName: RunnerOutputStream

  ): Promise<BufferedOutput> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let text = "";
    let totalBytes = 0;
    let truncated = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        this.waitingForInput = false;
        this.clearInputTimeout();
        this.scheduleIdleTimeout();

        const chunk = decoder.decode(value);
        this.callbacks.onOutput?.(streamName, chunk);

        if (!truncated) {
          totalBytes += value.length;

          if (totalBytes > OUTPUT_LIMIT_BYTES) {
            const remainingSpace = OUTPUT_LIMIT_BYTES - (totalBytes - value.length);
            const remainingText = decoder.decode(value.slice(0, remainingSpace));

            if (remainingSpace > 0) {
              text += remainingText;
              this.callbacks.onOutput?.(streamName, remainingText);

            }

            truncated = true;
            break;

          }
          else {
            text += chunk;

          }

        }

      }

    }
    finally {
      reader.releaseLock();

    }

    return { text, truncated };

  }

  private scheduleIdleTimeout(): void {
    if (this.waitingForInput) return;

    this.clearIdleTimeout();

    this.idleTimeout = setTimeout(() => {
      if (this.waitingForInput) return;

      this.waitingForInput = true;
      this.callbacks.onInputRequest?.();
      this.inputTimeout = setTimeout(() => this.timeout(), INPUT_TIMEOUT_MS);

    }, IDLE_INPUT_REQUEST_MS);

  }

  private timeout(): void {
    this.timedOut = true;
    this.kill();

  }

  private kill(): void {
    this.clearTimers();
    Bun.spawn(this.commands.kill);

  }

  private clearTimers(): void {
    this.clearIdleTimeout();
    this.clearInputTimeout();

    if (this.hardTimeout) clearTimeout(this.hardTimeout);

  }

  private clearIdleTimeout(): void {
    if (this.idleTimeout) clearTimeout(this.idleTimeout);

  }

  private clearInputTimeout(): void {
    if (this.inputTimeout) clearTimeout(this.inputTimeout);

  }

}
