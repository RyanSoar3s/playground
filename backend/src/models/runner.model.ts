import type { ExecutionStatus } from "./response.model";

export type RunnerCommands = {
  start: string[],
  kill: string[]

};

export type RunnerOutputStream = "stdout" | "stderr";

export type RunnerCallbacks = {
  onOutput?: (stream: RunnerOutputStream, text: string) => void,
  onInputRequest?: () => void

};

export type BufferedOutput = {
  text: string,
  truncated: boolean

};

export type RunnerResult = {
  status: ExecutionStatus,
  stdout: BufferedOutput,
  stderr: string,
  exitCode: number | null,
  durationMs: number
  
};
