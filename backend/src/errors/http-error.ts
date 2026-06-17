import type { ErrorResult } from "@models/response.model";

export default class HttpError extends Error {
  statusCode: number;
  body: ErrorResult;

  constructor(statusCode: number, body: ErrorResult) {
    super(body.message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.body = body;

  }

}
