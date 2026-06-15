import generateId from "@utils/generate-id";
import type { Languages } from "@models/languages.model";
import type { ExecutionRequest } from "@models/request.model";
import { writeFile, exists, mkdir, unlink } from "node:fs/promises";
import type { ErrorResult, ExecutionResult } from "@models/response.model";
import getNodeJsCommand from "@utils/nodejs.util";
import getBunCommand from "@utils/bun.util";
import getCPythonCommand from "@utils/cpython.util";
import getPypyCommand from "@utils/pypy.util";
import runner from "@runners/runner";
import HttpError from "@errors/http-error";

export default class ExecutionService {
  private payload: ExecutionRequest;

  private readonly getCommands: Record<Languages, Record<string, (filePathLocal: string, extension: string) => string[]>> = {
    javascript: {
      nodejs: getNodeJsCommand,
      bun: getBunCommand

    },
    typescript: {
      nodejs: getNodeJsCommand,
      bun: getBunCommand

    },
    python: {
      cpython: getCPythonCommand,
      pypy: getPypyCommand

    }

  };

  private readonly extensions: Record<Languages, string> = {
    javascript: "js",
    typescript: "ts",
    python: "py"

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
      const start = [
        "docker",
        "run",
        "--rm",
        "--name", `runner_${id}`,
        "--network", "none",
        "--memory", "128m",
        "--cpus", "0.5",
        "-i",
        "-v"

      ]
      start.push(...this.getCommands[lang][runtime]!(filePathLocal, extension));

      const kill = [
        "docker",
        "kill",
        `runner_${id}`

      ];

      let runnerResult = await runner({
        start,
        kill

      }, stdin);

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
        message: "An error occurred on the server.",
        errors: []

      } satisfies ErrorResult);

    }
    finally {
      await unlink(filePathLocal)
      .catch(() => {});

    }

  }

}
