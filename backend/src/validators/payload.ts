import type { ExecutionRequest } from "@models/request.model";
import type { ErrorResult } from "@models/response.model";
import HttpError from "@errors/http-error";
import executionRequestSchema from "../schemas/schema";

const checkPayload = (payload: ExecutionRequest) => {
  const safeParse = executionRequestSchema.safeParse(payload, { reportInput: true });

  if (!safeParse.success) {
    const issues = safeParse.error.issues;

    const errorResult: ErrorResult = {
      status: "validation_error",
      message: "Invalid fields",
      errors: []

    };

    issues.forEach((error) => {
      const path = error.path.map((p) => String(p));

      errorResult.errors.push(
        {
          field: (path[0]) ? path[0] : "unknown",
          message: error.message

        } satisfies ErrorResult["errors"][number]);

    });

    throw new HttpError(400, errorResult);

  }

}

export default checkPayload;
