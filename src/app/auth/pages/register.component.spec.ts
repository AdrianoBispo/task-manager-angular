import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { RegisterComponent } from './register.component';
import { RegisterPayload } from '../../shared/models/auth.model';

describe('RegisterComponent', () => {
  let router: Router;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });

  it('should validate nome, email and senha fields', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;

    component.form.setValue({ nome: 'Jo', email: 'invalido', senha: '123' });

    expect(component.form.valid).toBeFalse();
    expect(component.form.controls.nome.errors).toEqual(jasmine.objectContaining({ minlength: jasmine.any(Object) }));
    expect(component.form.controls.email.errors).toEqual(jasmine.objectContaining({ email: true }));
    expect(component.form.controls.senha.errors).toEqual(jasmine.objectContaining({ minlength: jasmine.any(Object) }));
  });

  it('should call authService.register and navigate to /tasks when successful', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;

    const payload: RegisterPayload = { nome: 'User', email: 'user@example.com', senha: '123456' };

    authService.register.and.returnValue(of({
      token: 'jwt-token',
      usuario: { id: '1', nome: 'User', email: 'user@example.com' }
    }));

    component.form.setValue(payload);
    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith(payload);
    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    expect(component.errorMessage).toBeNull();
    expect(component.isSubmitting).toBeFalse();
  });

  it('should show validation feedback for 400 and 422 errors', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;

    authService.register.and.returnValue(throwError(() => ({ status: 422, message: 'Email já cadastrado' })));

    component.form.setValue({ nome: 'User', email: 'user@example.com', senha: '123456' });
    component.onSubmit();

    expect(component.errorMessage).toBe('Email já cadastrado');
    expect(component.isSubmitting).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should not submit when form is invalid', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;

    component.form.setValue({ nome: '', email: '', senha: '' });
    component.onSubmit();

    expect(authService.register).not.toHaveBeenCalled();
  });
});
