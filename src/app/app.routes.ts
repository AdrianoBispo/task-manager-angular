import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './auth/auth.routes';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  {
    path: 'auth',
    children: AUTH_ROUTES
  },
  {
    path: 'tasks',
    loadComponent: () => import('./tasks/pages/tasks.component').then(m => m.TasksComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/tasks' }
];
