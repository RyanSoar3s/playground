import { computed, Injectable, signal } from '@angular/core';
import type { HealthResult } from '@models/health.model';

@Injectable({
  providedIn: 'root',
})
export class Health {
  private health = signal<HealthResult | undefined>(undefined);
  checkHealth = computed(() => this.health());

  setHealth(value: HealthResult): void {
    this.health.set(value);

  }

}
