import { vi } from 'vitest';
import { signal } from '@angular/core';
import { LanguageList } from '@models/language-list.model';
import { MOCK_LANGUAGE_LIST } from '@mocks/language-list.mock';

export class GetLanguagesMock {
  languages = signal<LanguageList | null>(null);
  errors = signal<string | null>(null);

  setLanguages = vi.fn((lang: LanguageList) => this.languages.set(lang));
  setErrors = vi.fn((err: string) => this.errors.set(err));

  seedLanguages(): void {
    this.languages.set(MOCK_LANGUAGE_LIST);
  }

  seedErrors(message = 'mock error'): void {
    this.errors.set(message);
  }
}
