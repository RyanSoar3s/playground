import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LanguageList } from '../../models/language-list.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  checkHealth(): Observable<{ status: "ok" | "error", error: null | string }> { 
    return this.http.get<{ status: "ok" | "error", error: null | string }>(`${this.baseUrl}/health`);

  }

  getLanguages(): Observable<LanguageList> {
    return this.http.get<LanguageList>(`${this.baseUrl}/languages`);

  }

}
