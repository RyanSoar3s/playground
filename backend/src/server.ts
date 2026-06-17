import { Origin, Port } from "@config/env";
import Health from "@routes/health";
import Languages from "@routes/languages";
import type { ServerWebSocket } from "bun";
import type { ExecutionClientMessage, ExecutionServerMessage } from "@models/execution-message.model";
import type { ErrorResult } from "@models/response.model";
import type { ExecutionSocketData } from "@models/execution.model";
import checkPayload from "@validators/payload";
import ExecutionService from "@services/execution.service";
import HttpError from "@errors/http-error";

const send = (ws: ServerWebSocket<ExecutionSocketData>, message: ExecutionServerMessage) => {
  ws.send(JSON.stringify(message));

};

const internalError = {
  status: "internal_error",
  message: "An error occurred on the server.",
  errors: []

} satisfies ErrorResult;

const bootstrap = async () => {
  Bun.serve<ExecutionSocketData>({
    port: Number(Port) || 3000,
    routes: {
      "/api/health": {
        GET: async () => Health()

      },
      "/api/languages": {
        GET: async () => Languages()

      }

    },
    fetch(req, server) {
      const url = new URL(req.url);

      if (url.pathname === "/api/executions") {
        const upgraded = server.upgrade(req, {
          data: {}

        });

        if (upgraded) return;

        return new Response("WebSocket upgrade failed", { status: 400 });

      }

      return new Response("Not found", {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": Origin || "http://localhost:4200",
          "Access-Control-Allow-Credentials": "true"

        }

      });

    },
    websocket: {
      async message(ws, rawMessage) {
        try {
          const message = JSON.parse(String(rawMessage)) as ExecutionClientMessage;

          if (message.type === "execute") {
            if (ws.data.execution) ws.data.execution.cancel();

            checkPayload(message.payload);

            const execution = new ExecutionService(message.payload);
            ws.data.execution = execution;
            send(ws, {
              type: "execution_started",
              ...execution.metadata

            });

            await execution.execute({
              onOutput: (stream, text) => send(ws, {
                type: "output",
                stream,
                text

              }),
              onInputRequest: () => send(ws, {
                type: "input_request"

              })

            })
            .then((result) => {
              send(ws, {
                type: "result",
                result

              });

              if (ws.data.execution === execution) {
                ws.data.execution = undefined;

              }

            })
            .catch((error) => {
              const errorResult = (
                error instanceof HttpError

              ) ? error.body : internalError;

              send(ws, {
                type: "error",
                error: errorResult

              });

              if (ws.data.execution === execution) {
                ws.data.execution = undefined;

              }

            });

            return;

          }

          if (message.type === "stdin") {
            await ws.data.execution?.writeStdin(message.value);
            return;

          }

          if (message.type === "cancel") {
            ws.data.execution?.cancel();
            ws.data.execution = undefined;

          }

        }
        catch (error) {
          const errorResult = (
            error instanceof HttpError
            
          ) ? error.body : internalError;

          send(ws, {
            type: "error",
            error: errorResult

          });

        }

      },
      close(ws) {
        ws.data.execution?.cancel();
        ws.data.execution = undefined;

      }

    }

  });

};

export default bootstrap;
