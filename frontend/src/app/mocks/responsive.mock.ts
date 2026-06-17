import { vi } from 'vitest';

export class ResponsiveMock {
  isXs = vi.fn().mockReturnValue(false);
  isSm = vi.fn().mockReturnValue(false);
  isMd = vi.fn().mockReturnValue(false);
  isLg = vi.fn().mockReturnValue(true);
  isXl = vi.fn().mockReturnValue(true);
}
