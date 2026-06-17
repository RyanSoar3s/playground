export type ExecutionCallbacks = {
  onOutput?: (stream: "stdout" | "stderr", text: string) => void,
  onInputRequest?: () => void

};

export type ExecutionSocketData = {
  execution?: {
    metadata: {
      id: string,
      language: string,
      runtime: string
      
    },
    execute(callbacks: ExecutionCallbacks): Promise<unknown>,
    writeStdin(value: string): Promise<void>,
    cancel(): void

  }

};
