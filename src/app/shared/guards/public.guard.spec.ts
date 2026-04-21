import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { publicGuard } from './public.guard';

class AuthServiceMock {
  authenticated = false;

  isAuthenticated(): boolean {
    return this.authenticated;
  }
}

class RouterMock {
  navigate = jasmine.createSpy('navigate').and.resolveTo(true);
}

describe('publicGuard', () => {
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

  it('should allow navigation for unauthenticated users', () => {
    authServiceMock.authenticated = false;

    const result = TestBed.runInInjectionContext(() =>
      publicGuard({} as any, { url: '/auth/login' } as any)
    );

    expect(result).toBeTrue();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should redirect authenticated users to tasks page', () => {
    authServiceMock.authenticated = true;

    const result = TestBed.runInInjectionContext(() =>
      publicGuard({} as any, { url: '/auth/register' } as any)
    );

    expect(result).toBeFalse();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/tasks']);
  });
});
