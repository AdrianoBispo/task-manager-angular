import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { authInterceptor } from './auth.interceptor';

class AuthServiceMock {
  token: string | null = null;
  logout = jasmine.createSpy('logout');

  getToken(): string | null {
    return this.token;
  }
}

class RouterMock {
  navigate = jasmine.createSpy('navigate').and.resolveTo(true);
}

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceMock: AuthServiceMock;
  let routerMock: RouterMock;

  beforeEach(() => {
    authServiceMock = new AuthServiceMock();
    routerMock = new RouterMock();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should inject Authorization header when token exists', () => {
    authServiceMock.token = 'test-jwt';

    http.get('/api/tasks').subscribe();

    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt');
    req.flush({});
  });

  it('should not inject Authorization header when token is missing', () => {
    authServiceMock.token = null;

    http.get('/api/tasks').subscribe();

    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should logout and redirect on 401 response', () => {
    authServiceMock.token = 'test-jwt';

    http.get('/api/tasks').subscribe({
      error: () => undefined
    });

    const req = httpMock.expectOne('/api/tasks');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
