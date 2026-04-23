import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { LoginComponent } from './login.component';
import { LoginPayload } from '../../shared/models/auth.model';

describe('LoginComponent', () => {
  let router: Router;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });

  it('should validate email and password fields', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.form.setValue({ email: 'invalido', senha: '123' });

    expect(component.form.valid).toBeFalse();
    expect(component.form.controls.email.errors).toEqual(jasmine.objectContaining({ email: true }));
    expect(component.form.controls.senha.errors).toEqual(jasmine.objectContaining({ minlength: jasmine.any(Object) }));
  });

  it('should call authService.login and navigate to /tasks when successful', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    const payload: LoginPayload = { email: 'user@example.com', senha: '123456' };
    authService.login.and.returnValue(of({
      token: 'jwt-token',
      usuario: { id: '1', nome: 'User', email: 'user@example.com' }
    }));

    component.form.setValue(payload);
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith(payload);
    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    expect(component.errorMessage).toBeNull();
    expect(component.isSubmitting).toBeFalse();
  });

  it('should show 401 message when credentials are invalid', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    authService.login.and.returnValue(throwError(() => ({ status: 401 })));

    component.form.setValue({ email: 'user@example.com', senha: '123456' });
    component.onSubmit();

    expect(component.errorMessage).toBe('Email ou senha inválidos');
    expect(component.isSubmitting).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should not submit when form is invalid', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.form.setValue({ email: '', senha: '' });
    component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
  });
});
