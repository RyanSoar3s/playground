import type { Languages } from "./languages.model";

export type ExecutionRequest = {
  language: Languages,
  code: string,
  stdin?: string

};
