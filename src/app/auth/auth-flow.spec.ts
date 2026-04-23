import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './services/auth.service';
import { AuthPayload, LoginPayload, RegisterPayload } from '../shared/models/auth.model';

describe('Auth flow integration', () => {
  let authService: AuthService;
  let httpMock: HttpTestingController;

  const registerPayload: RegisterPayload = {
    nome: 'Novo Usuario',
    email: 'novo@example.com',
    senha: '123456'
  };

  const loginPayload: LoginPayload = {
    email: 'novo@example.com',
    senha: '123456'
  };

  const registerResponse: AuthPayload = {
    token: 'register-token',
    usuario: {
      id: '1',
      nome: 'Novo Usuario',
      email: 'novo@example.com'
    }
  };

  const loginResponse: AuthPayload = {
    token: 'login-token',
    usuario: {
      id: '1',
      nome: 'Novo Usuario',
      email: 'novo@example.com'
    }
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should complete register then login flow with persisted session', () => {
    let registerDone = false;
    let loginDone = false;

    authService.register(registerPayload).subscribe(response => {
      registerDone = true;
      expect(response).toEqual(registerResponse);
      expect(authService.getToken()).toBe('register-token');
      expect(authService.isAuthenticated()).toBeTrue();
    });

    const registerRequest = httpMock.expectOne('http://localhost:8080/api/auth/register');
    expect(registerRequest.request.method).toBe('POST');
    expect(registerRequest.request.body).toEqual(registerPayload);
    registerRequest.flush(registerResponse);

    authService.logout();
    expect(authService.getToken()).toBeNull();
    expect(authService.isAuthenticated()).toBeFalse();

    authService.login(loginPayload).subscribe(response => {
      loginDone = true;
      expect(response).toEqual(loginResponse);
      expect(authService.getToken()).toBe('login-token');
      expect(authService.isAuthenticated()).toBeTrue();
    });

    const loginRequest = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(loginRequest.request.method).toBe('POST');
    expect(loginRequest.request.body).toEqual(loginPayload);
    loginRequest.flush(loginResponse);

    expect(registerDone).toBeTrue();
    expect(loginDone).toBeTrue();
    expect(localStorage.getItem('task-manager-auth')).toEqual(JSON.stringify(loginResponse));
  });
});
