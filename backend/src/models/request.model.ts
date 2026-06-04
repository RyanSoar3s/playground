import type { Languages, Runtime } from "./languages.model";

export type ExecutionRequest = {
  language: Languages,
  runtime: Runtime,
  code: string,
  stdin?: string

};
