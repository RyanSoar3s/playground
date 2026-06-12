import { Languages, Runtime } from "./language-list.model";

export type ExecutionCode = {
  language: Languages;
  runtime: Runtime;
  code: string;
  stdin?: string | undefined;

}

export type ExecutionStatus =
  | "success"
  | "error"
  | "timeout";

export type ErrorStatus =
  | "validation_error"
  | "internal_error";

export type ExecutionResult = {
  id: string,
  language: Languages,
  runtime: Runtime,
  status: ExecutionStatus,
  stdout: {
    text: string,
    truncated: boolean

  },
  stderr: string,
  exitCode: number | null,
  durationMs: number

};

export type ErrorResult = {
  status: ErrorStatus,
  message: string,
  errors: Array<{
    field: string,
    message: string

  }>

};
