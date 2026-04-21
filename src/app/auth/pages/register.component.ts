import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h2 class="text-2xl font-bold mb-6">Entrar</h2>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
            />
            <div *ngIf="form.get('email')?.invalid && form.get('email')?.touched" class="text-red-500 text-sm mt-1">
              Email inválido
            </div>
          </div>

          <div>
            <label for="senha" class="block text-sm font-medium">Senha</label>
            <input
              id="senha"
              type="password"
              formControlName="senha"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            <div *ngIf="form.get('senha')?.invalid && form.get('senha')?.touched" class="text-red-500 text-sm mt-1">
              Senha obrigatória
            </div>
          </div>

          <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            [disabled]="!form.valid || isSubmitting"
            class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {{ isSubmitting ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <p class="mt-4 text-center text-sm">
          Não tem conta?
          <a routerLink="/auth/register" class="text-blue-500 hover:underline">Cadastrar</a>
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        this.errorMessage = err.status === 401 ? 'Email ou senha inválidos' : 'Erro ao conectar';
        this.isSubmitting = false;
      }
    });
  }
}
