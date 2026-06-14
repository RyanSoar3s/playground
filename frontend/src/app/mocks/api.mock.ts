import { vi } from 'vitest';
import { of } from 'rxjs';
import { ExecutionResult } from '@models/code-execution.model';
import { MOCK_LANGUAGE_LIST } from '@mocks/language-list.mock';

export class ApiMock {
  checkHealth = vi.fn().mockReturnValue(
    of({ status: 'ok' as const, error: null })
  );

  getLanguages = vi.fn().mockReturnValue(of(MOCK_LANGUAGE_LIST));

  executeCode = vi.fn().mockReturnValue(
    of<ExecutionResult>({
      id: 'mock-id',
      language: 'javascript',
      runtime: 'nodejs',
      status: 'success',
      stdout: { text: 'mock output\n', truncated: false },
      stderr: '',
      exitCode: 0,
      durationMs: 12
    })
  );
}
