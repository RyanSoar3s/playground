import type { ErrorResult } from "@models/response.model";
import HttpError from "@errors/http-error";

const readStreamWithLimit = async (stream: ReadableStream<Uint8Array>, maxBytes: number = 50000) => {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = "";
  let totalBytes = 0;
  let truncated = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.length;
      if (totalBytes > maxBytes) {
        const remainingSpace = maxBytes - (totalBytes - value.length);

        if (remainingSpace > 0) {
          result += decoder.decode(value.slice(0, remainingSpace));

        }
        truncated = true;
        break;

      }
      result += decoder.decode(value);

    }

  }
  catch (error) {
    console.error(`error: ${error}`);

    throw new HttpError(500, {
      status: "internal_error",
      message: "An error occurred on the server.",
      errors: []

    } satisfies ErrorResult);

  }
  finally {
    reader.releaseLock();

  }

  return { text: result, truncated };

}

export default readStreamWithLimit;
