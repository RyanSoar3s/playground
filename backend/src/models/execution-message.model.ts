import type { Languages, Runtime } from "./languages.model";
import type { ExecutionRequest } from "./request.model";
import type { ErrorResult, ExecutionResult } from "./response.model";

export type ExecutionClientMessage =
  | {
      type: "execute",
      payload: ExecutionRequest
    }
  | {
      type: "stdin",
      value: string
    }
  | {
      type: "cancel"
    };

export type ExecutionServerMessage =
  | {
      type: "execution_started",
      id: string,
      language: Languages,
      runtime: Runtime
    }
  | {
      type: "output",
      stream: "stdout" | "stderr",
      text: string
    }
  | {
      type: "input_request"
    }
  | {
      type: "result",
      result: ExecutionResult
    }
  | {
      type: "error",
      error: ErrorResult
    };
