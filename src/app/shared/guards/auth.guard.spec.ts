import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { authGuard } from './auth.guard';

class AuthServiceMock {
  authenticated = false;

  isAuthenticated(): boolean {
    return this.authenticated;
  }
}

class RouterMock {
  navigate = jasmine.createSpy('navigate').and.resolveTo(true);
}

describe('authGuard', () => {
  let authServiceMock: AuthServiceMock;
  let routerMock: RouterMock;

  beforeEach(() => {
    authServiceMock = new AuthServiceMock();
    routerMock = new RouterMock();

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  it('should allow navigation when user is authenticated', () => {
    authServiceMock.authenticated = true;

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/tasks' } as any)
    );

    expect(result).toBeTrue();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    authServiceMock.authenticated = false;

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/tasks?page=2' } as any)
    );

    expect(result).toBeFalse();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/tasks?page=2' }
    });
  });
});
