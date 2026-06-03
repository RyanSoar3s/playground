import type { Languages, LanguageLabels } from "./languages";

export type HealthResult = {
  status: "ok" | "error",
  error: null | string

};

export type LanguageResult = {
  languages: Array<{
    id: Languages,
    label: LanguageLabels,
    version: "bun",
    enable: boolean

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
  status: ExecutionStatus,
  stdout: string,
  stderr: string,
  exitCode: number | null,
  durationMs: number

};

export type ErrorResult = {
  status: ErrorStatus,
  message: string,
  errors?: Array<{
    field: string,
    message: string

  }>

};
