import generateId from "@utils/generate-id";
import type { Languages } from "@models/languages.model";
import type { ExecutionRequest } from "@models/request.model";
import type { ErrorResult, ExecutionResult } from "@models/response.model";
import type { ExecutionCallbacks } from "@models/execution.model";
import { writeFile, exists, mkdir, unlink } from "node:fs/promises";
import getNodeJsCommand from "@utils/nodejs.util";
import getBunCommand from "@utils/bun.util";
import getCPythonCommand from "@utils/cpython.util";
import getPypyCommand from "@utils/pypy.util";
import Runner from "@runners/runner";
import HttpError from "@errors/http-error";

export default class ExecutionService {
  private runner?: Runner;
  private readonly id = generateId();
  private readonly temp = "/tmp/playground";

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

  constructor(private readonly payload: ExecutionRequest) {}

  get metadata() {
    return {
      id: this.id,
      language: this.payload.language,
      runtime: this.payload.runtime

    };

  }

  async execute(callbacks: ExecutionCallbacks = {}): Promise<ExecutionResult> {
    const lang = this.payload.language;
    const runtime = this.payload.runtime;
    const code = this.payload.code;
    const extension = this.extensions[lang];
    const path = `${this.id}.${extension}`;
    const filePathLocal = `${this.temp}/${path}`;

    try {
      if (!(await exists(this.temp))) await mkdir(this.temp, { recursive: true });

      await writeFile(filePathLocal, code);

      const start = [
        "docker",
        "run",
        "--rm",
        "--name", `runner_${this.id}`,
        "--network", "none",
        "--memory", "128m",
        "--cpus", "0.5",
        "-i",
        "-v"
      ];

      start.push(...this.getCommands[lang][runtime]!(filePathLocal, extension));

      const kill = [
        "docker",
        "kill",
        `runner_${this.id}`

      ];

      this.runner = new Runner({ start, kill }, callbacks);
      const runnerResult = await this.runner.execute();

      return {
        id: this.id,
        language: lang,
        runtime,
        ...runnerResult

      } satisfies ExecutionResult;

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
      await unlink(filePathLocal).catch(() => {});

    }
  }

  async writeStdin(value: string): Promise<void> {
    await this.runner?.writeStdin(value);

  }

  cancel(): void {
    this.runner?.cancel();
    
  }
}
