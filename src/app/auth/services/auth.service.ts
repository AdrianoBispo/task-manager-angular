import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { HttpService } from '../../shared/services/http.service';
import { User, LoginPayload, RegisterPayload, AuthPayload } from '../../shared/models/auth.model';
import { map, distinctUntilChanged } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(this.restoreSession());
  private tokenSubject = new BehaviorSubject<string | null>(this.getStoredToken());

  public user$ = this.userSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();
  public isAuthenticated$ = this.user$.pipe(
    map(user => !!user),
    distinctUntilChanged()
  );

  constructor(private http: HttpService) {}

  login(payload: LoginPayload): Observable<AuthPayload> {
    return this.http.post<AuthPayload>('/api/auth/login', payload).pipe(
      tap(response => this.setSession(response.token, response.usuario)),
      catchError(error => throwError(() => error))
    );
  }

  register(payload: RegisterPayload): Observable<AuthPayload> {
    return this.http.post<AuthPayload>('/api/auth/register', payload).pipe(
      tap(response => this.setSession(response.token, response.usuario)),
      catchError(error => throwError(() => error))
    );
  }

  logout(): void {
    this.userSubject.next(null);
    this.tokenSubject.next(null);
    localStorage.removeItem('task-manager-auth');
  }

  setSession(token: string, user: User): void {
    this.tokenSubject.next(token);
    this.userSubject.next(user);
    localStorage.setItem('task-manager-auth', JSON.stringify({ token, user }));
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }

  private restoreSession(): User | null {
    const stored = localStorage.getItem('task-manager-auth');
    if (stored) {
      try {
        const { token, user } = JSON.parse(stored);
        this.tokenSubject.next(token);
        return user;
      } catch (e) {
        console.error('Failed to restore session', e);
      }
    }
    return null;
  }

  private getStoredToken(): string | null {
    const stored = localStorage.getItem('task-manager-auth');
    if (stored) {
      try {
        return JSON.parse(stored).token;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}
