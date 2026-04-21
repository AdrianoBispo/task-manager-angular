import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

type HttpRequestOptions = {
  headers?: HttpHeaders | Record<string, string | string[]>;
  context?: HttpContext;
  observe?: 'body';
  params?:
    | HttpParams
    | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
};

@Injectable({ providedIn: 'root' })
export class HttpService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string> }).env;
    this.baseUrl = viteEnv?.['VITE_API_BASE_URL'] || 'http://localhost:8080';
  }

  get<T>(path: string, options?: HttpRequestOptions): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, options);
  }

  post<T, B = any>(path: string, body: B, options?: HttpRequestOptions): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body, options);
  }

  patch<T, B = any>(path: string, body: B, options?: HttpRequestOptions): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body, options);
  }

  delete<T>(path: string, options?: HttpRequestOptions): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`, options);
  }
}
