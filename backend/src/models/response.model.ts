import type { Languages, LanguageLabels, Runtime } from "./languages.model";

export type HealthResult = {
  status: "ok" | "error",
  error: null | string

};

export type LanguageResult = {
  languages: Array<{
    id: Languages,
    label: LanguageLabels,
    runtimes: {
      type: Runtime,
      version: string

    }[],
    enabled: boolean

  }>

};

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
