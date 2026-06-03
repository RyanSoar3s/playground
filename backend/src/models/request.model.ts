import type { Languages } from "./languages";

export type ExecutionRequest = {
  language: Languages,
  code: string,
  stdin?: string

};
