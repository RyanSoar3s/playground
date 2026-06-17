import { vi } from 'vitest';
import { signal } from '@angular/core';
import type { HealthResult } from '@models/health.model';
import { MOCK_HEALTH_OK } from '@mocks/language-list.mock';

export class HealthMock {
  checkHealth = signal<HealthResult | undefined>(undefined);

  setHealth = vi.fn((value: HealthResult) =>
    this.checkHealth.set(value)
  );

  seedOk(): void {
    this.checkHealth.set(MOCK_HEALTH_OK);
  }

  seedError(message = 'unavailable'): void {
    this.checkHealth.set({ status: 'error', error: message } as HealthResult);
  }
}
