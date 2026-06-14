import { vi } from 'vitest';
import { signal } from '@angular/core';
import { MOCK_HEALTH_OK } from '@mocks/language-list.mock';

export class HealthMock {
  checkHealth = signal<{ status: 'ok' | 'error', error: null | string } | undefined>(undefined);

  setHealth = vi.fn((value: { status: 'ok' | 'error', error: null | string }) =>
    this.checkHealth.set(value)
  );

  seedOk(): void {
    this.checkHealth.set(MOCK_HEALTH_OK);
  }

  seedError(message = 'unavailable'): void {
    this.checkHealth.set({ status: 'error', error: message });
  }
}
