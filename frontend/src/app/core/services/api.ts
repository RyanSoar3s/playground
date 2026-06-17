import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LanguageList } from '@models/language-list.model';
import type { HealthResult } from '@models/health.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  checkHealth(): Observable<HealthResult> {
    return this.http.get<HealthResult>(`${this.baseUrl}/health`);
  }

  getLanguages(): Observable<LanguageList> {
    return this.http.get<LanguageList>(`${this.baseUrl}/languages`);
  }

}
