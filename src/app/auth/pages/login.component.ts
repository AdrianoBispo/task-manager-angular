import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginPayload } from '../../shared/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]]
  });
  isSubmitting = false;
  errorMessage: string | null = null;

  ngOnInit() {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = null;
    this.isSubmitting = true;

    const payload: LoginPayload = this.form.getRawValue();

    this.authService.login(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/tasks']);
      },
      error: (err: { status?: number }) => {
        this.errorMessage = err.status === 401 ? 'Email ou senha inválidos' : 'Erro ao conectar';
        this.isSubmitting = false;
      }
    });
  }
}
