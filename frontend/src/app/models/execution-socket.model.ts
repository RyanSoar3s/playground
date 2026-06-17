import type { ExecutionClientMessage, ExecutionServerMessage } from "./code-execution.model";

export type ExecutionSocketMessage = ExecutionClientMessage | ExecutionServerMessage;
