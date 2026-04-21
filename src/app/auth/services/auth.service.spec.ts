import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AuthPayload, LoginPayload, RegisterPayload } from '../../shared/models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const loginPayload: LoginPayload = {
    email: 'test@example.com',
    senha: 'secret123'
  };

  const registerPayload: RegisterPayload = {
    nome: 'Teste',
    email: 'test@example.com',
    senha: 'secret123'
  };

  const authResponse: AuthPayload = {
    token: 'jwt-token',
    usuario: {
      id: '1',
      nome: 'Teste',
      email: 'test@example.com'
    }
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should login and persist session', () => {
    let responseBody: AuthPayload | undefined;

    service.login(loginPayload).subscribe(response => {
      responseBody = response;
    });

    const request = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(loginPayload);
    request.flush(authResponse);

    expect(responseBody).toEqual(authResponse);
    expect(service.getToken()).toBe('jwt-token');
    expect(service.isAuthenticated()).toBeTrue();
    expect(localStorage.getItem('task-manager-auth')).toEqual(JSON.stringify(authResponse));
  });

  it('should register and persist session', () => {
    service.register(registerPayload).subscribe();

    const request = httpMock.expectOne('http://localhost:8080/api/auth/register');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(registerPayload);
    request.flush(authResponse);

    expect(service.getToken()).toBe('jwt-token');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should logout and clear localStorage', () => {
    localStorage.setItem('task-manager-auth', JSON.stringify(authResponse));
    service.restoreSession();

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('task-manager-auth')).toBeNull();
  });

  it('should restore session from localStorage', () => {
    localStorage.setItem('task-manager-auth', JSON.stringify(authResponse));

    service.restoreSession();

    expect(service.getToken()).toBe('jwt-token');
    expect(service.isAuthenticated()).toBeTrue();
  });
});
