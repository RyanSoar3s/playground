import type { ExecutionRequest } from "../models/request.model";
import type { ErrorResult } from "../models/response.model";
import { allowedLanguages } from "../../utils/language-list";
import type { Languages } from "../models/languages.model";

const checkPayload = (payload: ExecutionRequest) => {
  const languageFieldValid =
    payload.language &&
    typeof payload.language === "string"

  if (!languageFieldValid) {
    throw new Error(JSON.stringify({
      status: "validation_error",
      message: "Undefined language",
      errors: [
        {
          field: "language",
          message: (!payload.language) ?
                    "Language cannot be empty" :
                    "Language should be a string"

        }

      ]

    } satisfies ErrorResult));

  }

  const allowedLanguagesKeys = Object.keys(allowedLanguages) as Languages[];

  if (!allowedLanguagesKeys.includes(payload.language)) {
    throw new Error(JSON.stringify({
      status: "validation_error",
      message: "Unsupported language",
      errors: [
        {
          field: "language",
          message: `Language '${payload.language}' is not supported`

        }

      ]

    } satisfies ErrorResult));

  }

  if (!allowedLanguages[payload.language].includes(payload.runtime)) {
    throw new Error(JSON.stringify({
      status: "validation_error",
      message: "Unsupported runtime",
      errors: [
        {
          field: "runtitme",
          message: `Runtime '${payload.runtime}' is not supported`

        }

      ]

    } satisfies ErrorResult));

  }

  const codeFieldValid =
    typeof payload.code === "string"
    && payload.code !== "";

  if (!codeFieldValid) {
    throw new Error(JSON.stringify({
      status: "validation_error",
      message: "Invalid code",
      errors: [
        {
          field: "code",
          message: (!payload.code) ?
                    "Code cannot be empty" :
                    "Code should be a string"

        }

      ]

    } satisfies ErrorResult));

  }

  const stdinFieldValid = typeof payload.stdin === "string";

  if (!stdinFieldValid) {
    throw new Error(JSON.stringify({
      status: "validation_error",
      message: "Invalid input",
      errors: [
        {
          field: "stdin",
          message: "Input should be a string"

        }

      ]

    } satisfies ErrorResult));

  }

}

export default checkPayload;
