import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Health } from '@core/services/health';
import { GetLanguages } from '@core/services/get-languages';

export const errorGuard: CanActivateFn = () => {
  const health = inject(Health);
  const languagesServices = inject(GetLanguages);
  const router = inject(Router);

  if (
    health.checkHealth() === undefined ||
    (health.checkHealth()?.status === "ok" && !languagesServices.errors())
  ) {
    router.navigate([ "" ]);
    return false;
  }

  return true;
};
