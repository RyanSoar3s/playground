import generateId from "@utils/generate-id";
import type { Languages, Runtime } from "@models/languages.model";
import type { ExecutionRequest } from "@models/request.model";
import { writeFile, exists, mkdir, unlink } from "node:fs/promises";
import type { ErrorResult, ExecutionResult } from "@models/response.model";
import getNodeJsCommand from "@utils/nodejs.util";
import runner from "@runners/runner";
import HttpError from "@errors/http-error";

export default class ExecutionService {
  private payload: ExecutionRequest;

  private readonly getCommands: Record<Languages, Record<Runtime, (filePathLocal: string, extension: string) => string[]>> = {
    javascript: {
      nodejs: getNodeJsCommand

    }

  };

  private readonly extensions: Record<Languages, string> = {
    javascript: "js"

  };

  constructor(payload: ExecutionRequest) {
    this.payload = payload;

  }

  async execute(): Promise<ExecutionResult> {
    const lang = this.payload.language;
    const runtime = this.payload.runtime;
    const code = this.payload.code;
    const stdin = this.payload.stdin;

    const id = generateId();
    const extension = this.extensions[lang];
    const path = `${id}.${extension}`;
    const temp = "/tmp/playground";
    const filePathLocal = `${temp}/${path}`;


    try {
      if (!(await exists(temp))) await mkdir(temp, { recursive: true });

      await writeFile(filePathLocal, code);
      const commands = [
        "docker",
        "run",
        "--rm",
        "--network", "none",
        "--memory", "128m",
        "--cpus", "0.5",
        "-i",
        "-v"

      ]

      commands.push(...this.getCommands[lang][runtime](filePathLocal, extension));

      let runnerResult = await runner(commands, stdin);

      const result = {
        id,
        language: lang,
        runtime,
        ...runnerResult

      } satisfies ExecutionResult;

      return result;


    } catch (error) {
      console.error(`error: ${error}`);

      throw new HttpError(500, {
        status: "internal_error",
        message: "An error occurred on the server."

      } satisfies ErrorResult);

    }
    finally {
      await unlink(filePathLocal)
      .catch(() => {});

    }

  }

}
