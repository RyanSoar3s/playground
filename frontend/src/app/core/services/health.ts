import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Health {
  private health = signal<{ status: "ok" | "error", error: null | string } | undefined >(undefined);
  checkHealth = computed(() => this.health());

  setHealth(value: { status: "ok" | "error", error: null | string }): void {
    this.health.set(value);

  }

}
