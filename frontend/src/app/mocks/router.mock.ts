import { vi } from 'vitest';

export class RouterMock {
  navigate = vi.fn().mockResolvedValue(true);
  navigateByUrl = vi.fn().mockResolvedValue(true);
}
