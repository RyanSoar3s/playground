import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Api } from '../services/api';
import { map, take, tap, catchError, of } from 'rxjs';
import { GetLanguages } from '../services/get-languages';

export const getLanguagesResolver: ResolveFn<void> = () => {
  const api = inject(Api);
  const languagesServices = inject(GetLanguages);

  return api.getLanguages().pipe(
    take(1),
    tap((data) => languagesServices.setLanguages(data)),
    map(() => undefined),
    catchError((err) => {
      const error = `error: ${(typeof err === "object") ? JSON.stringify(err) : err}`;

      console.error(error);

      languagesServices.setErrors(error);

      return of(undefined)

    })

  );

};
