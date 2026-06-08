import { computed, Injectable, signal } from '@angular/core';
import { LanguageList } from '../../models/language-list.model';

@Injectable({
  providedIn: 'root',
})
export class GetLanguages {
  private languagesSignal = signal<LanguageList | null>(null);
  languaguages = computed(() => this.languagesSignal());

  setLanguages(lang: LanguageList): void {
    this.languagesSignal.set(lang);

  }

}
