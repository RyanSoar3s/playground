import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { take, tap, map, catchError, of } from 'rxjs';
import { Api } from '@core/services/api';
import { Health } from '@core/services/health';

export const healthGuard: CanActivateFn = () => {
  const api = inject(Api);
  const health = inject(Health);
  const router = inject(Router);

  return api.checkHealth()
  .pipe(
    take(1),
    tap((data) => {
      health.setHealth(data);
      console.log(`[Server] {\n  status: '${data.status}',\n  error: ${data.error}\n}`);

    }),
    map(() => true),
    catchError((err) => {
      const status = ("status" in err && typeof err.status === "string") ? (err.status) : "error";
      const error = (typeof err === "object") ? JSON.stringify(err) : err;

      const response = {
        status: "error",
        error: (typeof err === "object" && "message" in err) ? `${err.message}` : "unknown",

      } satisfies {
        status: "error" | "ok";
        error: string | null;

      };

      health.setHealth(response);
      router.navigate([ "/error" ]);

      console.error(`[Server] {\n  status: '${status}',\n  error: ${error}\n}`);

      return of(false);

    })

  )

};
