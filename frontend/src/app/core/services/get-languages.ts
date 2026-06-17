import { computed, Injectable, signal } from '@angular/core';
import { LanguageList } from '@models/language-list.model';

@Injectable({
  providedIn: 'root',
})
export class GetLanguages {
  private languagesSignal = signal<LanguageList | null>(null);
  private errorsSignal = signal<string | null>(null);

  languages = computed(() => this.languagesSignal());
  errors = computed(() => this.errorsSignal());

  setLanguages(lang: LanguageList): void {
    this.languagesSignal.set(lang);

  }

  setErrors(err: string): void {
    this.errorsSignal.set(err);

  }

}
