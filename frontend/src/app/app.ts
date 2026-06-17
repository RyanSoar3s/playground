import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GetLanguages } from '@core/services/get-languages';
import { LoadingSkeleton } from '@features/shared/loading-skeleton/loading-skeleton';
import { Header } from '@features/shared/header/header';
import { Footer } from '@features/shared/footer/footer';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    LoadingSkeleton,
    Header,
    Footer
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private languagesServices = inject(GetLanguages);

  protected readonly languages = this.languagesServices.languages;
  protected readonly errors = this.languagesServices.errors;

  protected readonly isAppLoading = computed(() => this.languages() === null && this.errors() === null);

}
