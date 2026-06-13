import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Health } from '../services/health';
import { GetLanguages } from '../services/get-languages';

export const errorGuard: CanActivateFn = () => {
  const health = inject(Health);
  const languagesServices = inject(GetLanguages);
  const router = inject(Router); console.log(health.checkHealth())

  if (health.checkHealth() === undefined || health.checkHealth() && health.checkHealth()?.status === "ok" && !languagesServices.errors()) {
    router.navigate([ "" ]);
    return false;

  }

  return true;

};
