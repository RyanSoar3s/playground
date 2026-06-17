import { vi } from 'vitest';
import { of } from 'rxjs';

export class ExecutionWebSocketMock {
  executeCode = vi.fn().mockReturnValue(
    of(
      {
        type: "output",
        stream: "stdout",
        text: "mock output\n"
      },
      {
        type: "result",
        result: {
          id: 'mock-id',
          language: 'javascript',
          runtime: 'nodejs',
          status: 'success',
          stdout: { text: 'mock output\n', truncated: false },
          stderr: '',
          exitCode: 0,
          durationMs: 12
        }
      }
    )
  );

  sendStdin = vi.fn();
  cancel = vi.fn();
}
