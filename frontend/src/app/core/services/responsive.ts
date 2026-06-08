import { computed, inject, Injectable } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout'
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Responsive {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly breakpoints = {
    XS: '(max-width: 599px)',
    SM: '(min-width: 600px) and (max-width: 749px)',
    MD: '(min-width: 750px) and (max-width: 979px)',
    LG: '(min-width: 980px) and (max-width: 1199px)',
    XL: '(min-width: 1200px)'

  };

  private readonly layoutChange = toSignal(
    this.breakpointObserver
    .observe(Object.values(this.breakpoints))
    .pipe(map(({ breakpoints }) => breakpoints))

  );

  public readonly isXs = computed(() => this.layoutChange()?.[this.breakpoints.XS] ?? false);
  public readonly isSm = computed(() => this.layoutChange()?.[this.breakpoints.SM] ?? false);
  public readonly isMd = computed(() => this.layoutChange()?.[this.breakpoints.MD] ?? false);
  public readonly isLg = computed(() => this.layoutChange()?.[this.breakpoints.LG] ?? false);
  public readonly isXl = computed(() => this.layoutChange()?.[this.breakpoints.XL] ?? false);

}
