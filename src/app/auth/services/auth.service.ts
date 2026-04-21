import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, distinctUntilChanged, map, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpService } from '../../shared/services/http.service';
import { User, LoginPayload, RegisterPayload, AuthPayload } from '../../shared/models/auth.model';

type StoredAuthSession = {
  token: string;
  usuario: User;
};

const AUTH_STORAGE_KEY = 'task-manager-auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly initialSession = this.readStoredSession();
  private userSubject = new BehaviorSubject<User | null>(this.initialSession?.usuario ?? null);
  private tokenSubject = new BehaviorSubject<string | null>(this.initialSession?.token ?? null);

  public user$ = this.userSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();
  public isAuthenticated$ = this.user$.pipe(
    map(user => !!user),
    distinctUntilChanged()
  );

  constructor(private http: HttpService) {
    this.restoreSession();
  }

  login(payload: LoginPayload): Observable<AuthPayload> {
    return this.http.post<AuthPayload, LoginPayload>('/api/auth/login', payload).pipe(
      tap(response => this.setSession(response)),
      catchError(error => throwError(() => error))
    );
  }

  register(payload: RegisterPayload): Observable<AuthPayload> {
    return this.http.post<AuthPayload, RegisterPayload>('/api/auth/register', payload).pipe(
      tap(response => this.setSession(response)),
      catchError(error => throwError(() => error))
    );
  }

  logout(): void {
    this.userSubject.next(null);
    this.tokenSubject.next(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  restoreSession(): void {
    const stored = this.readStoredSession();

    if (!stored) {
      this.logout();
      return;
    }

    this.tokenSubject.next(stored.token);
    this.userSubject.next(stored.usuario);
  }

  private setSession(authPayload: AuthPayload): void {
    this.tokenSubject.next(authPayload.token);
    this.userSubject.next(authPayload.usuario);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authPayload));
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  private readStoredSession(): StoredAuthSession | null {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<StoredAuthSession>;

      if (!parsed.token || !parsed.usuario) {
        return null;
      }

      return {
        token: parsed.token,
        usuario: parsed.usuario
      };
    } catch {
      return null;
    }
  }
}
