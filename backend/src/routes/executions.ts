import type { BunRequest } from "bun";
import type { ExecutionRequest } from "@models/request.model";
import type { ErrorResult } from "@models/response.model";
import checkPayload from "@validators/payload";
import ExecutionService from "@services/execution.service";
import { Origin } from "@config/env";
import HttpError from "@errors/http-error";

const jsonHeaders = {
  "Access-Control-Allow-Origin": Origin || "http://localhost:4200",
  "Access-Control-Allow-Credentials": "true",
  "Content-Type": "application/json"

};

const Execution = async (req: BunRequest) => {
  try {
    const payload: ExecutionRequest = await req.json() as ExecutionRequest;

    checkPayload(payload);

    const execution = new ExecutionService(payload);

    const result = await execution.execute();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: jsonHeaders

    });

  }
  catch (error) {
    console.error(error);

    const errorResult = (
      error instanceof HttpError

    ) ? error.body : {
      status: "internal_error",
      message: "An error occurred on the server.",
      errors: []

    } satisfies ErrorResult;

    return new Response(JSON.stringify(errorResult), {
      status: (error instanceof HttpError) ? error.statusCode : 500,
      headers: jsonHeaders

    });

  }

};

export default Execution;
