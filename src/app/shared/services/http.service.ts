import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HttpService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:8080';
  }

  get<T>(path: string, options?: any): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, options);
  }

  post<T, B = any>(path: string, body: B, options?: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body, options);
  }

  patch<T, B = any>(path: string, body: B, options?: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body, options);
  }

  delete<T>(path: string, options?: any): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`, options);
  }
}
