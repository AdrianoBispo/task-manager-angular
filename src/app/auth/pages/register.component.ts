import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RegisterPayload } from '../../shared/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
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

    const payload: RegisterPayload = this.form.getRawValue();

    this.authService.register(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/tasks']);
      },
      error: (err: { status?: number; message?: string }) => {
        if (err.status === 400 || err.status === 422) {
          this.errorMessage = err.message ?? 'Dados de cadastro inválidos';
        } else {
          this.errorMessage = 'Erro ao conectar';
        }

        this.isSubmitting = false;
      }
    });
  }
}
