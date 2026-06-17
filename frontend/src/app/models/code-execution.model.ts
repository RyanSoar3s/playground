import { Languages, Runtime } from "./language-list.model";

export type ExecutionCode = {
  language: Languages;
  runtime: Runtime;
  code: string;

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

export type ExecutionClientMessage =
  | {
      type: "execute";
      payload: ExecutionCode;
    }
  | {
      type: "stdin";
      value: string;
    }
  | {
      type: "cancel";
    };

export type ExecutionServerMessage =
  | {
      type: "execution_started";
      id: string;
      language: Languages;
      runtime: Runtime;
    }
  | {
      type: "output";
      stream: "stdout" | "stderr";
      text: string;
    }
  | {
      type: "input_request";
    }
  | {
      type: "result";
      result: ExecutionResult;
    }
  | {
      type: "error";
      error: ErrorResult;
    };
