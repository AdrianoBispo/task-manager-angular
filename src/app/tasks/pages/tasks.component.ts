import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, EMPTY } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';

import { AuthService } from '../../auth/services/auth.service';
import {
  Task,
  TasksFiltersValue,
  UpsertTaskPayload,
  defaultFilters
} from '../../shared/models/task.model';
import { ErrorService } from '../../shared/services/error.service';
import { TaskFormComponent } from '../components/task-form/task-form.component';
import { TaskItemComponent } from '../components/task-item/task-item.component';
import { TasksService } from '../services/tasks.service';

type ToastType = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, TaskItemComponent, TaskFormComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksComponent implements OnInit, OnDestroy {
  private readonly tasksService = inject(TasksService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorService);

  readonly tasks$ = this.tasksService.tasks$;
  readonly meta$ = this.tasksService.meta$;
  readonly isLoading$ = this.tasksService.isLoading$;
  readonly user$ = this.authService.user$;

  readonly destroy$ = new Subject<void>();

  currentFilters: TasksFiltersValue = defaultFilters;
  isFormOpen = false;
  editingTask: Task | null = null;
  isSubmitting = false;

  toast: { type: ToastType; message: string } | null = null;

  ngOnInit(): void {
    this.loadTasks(defaultFilters);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCreateTask(): void {
    this.editingTask = null;
    this.isFormOpen = true;
  }

  onEditTask(task: Task): void {
    this.editingTask = task;
    this.isFormOpen = true;
  }

  onCancelTaskForm(): void {
    this.editingTask = null;
    this.isFormOpen = false;
  }

  onSaveTask(payload: UpsertTaskPayload): void {
    const operation$ = this.editingTask
      ? this.tasksService.updateTask(this.editingTask.id, payload)
      : this.tasksService.createTask(payload);

    this.isSubmitting = true;
    this.showToast('loading', this.editingTask ? 'Atualizando tarefa...' : 'Criando tarefa...');

    operation$
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        }),
        takeUntil(this.destroy$),
        catchError(error => {
          this.showToast('error', this.errorService.getUserMessage(error));
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.showToast('success', this.editingTask ? 'Tarefa atualizada.' : 'Tarefa criada.');
        this.onCancelTaskForm();
        this.loadTasks(this.currentFilters);
      });
  }

  onDeleteTask(id: string): void {
    const shouldDelete = window.confirm('Deseja realmente deletar esta tarefa?');

    if (!shouldDelete) {
      return;
    }

    this.showToast('loading', 'Removendo tarefa...');

    this.tasksService
      .deleteTask(id)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.showToast('error', this.errorService.getUserMessage(error));
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.showToast('success', 'Tarefa removida.');
        this.loadTasks(this.currentFilters);
      });
  }

  onMarkComplete(task: Task): void {
    if (task.status === 'CONCLUIDA') {
      return;
    }

    this.showToast('loading', 'Marcando tarefa como concluida...');

    this.tasksService
      .updateTask(task.id, {
        status: 'CONCLUIDA'
      })
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.showToast('error', this.errorService.getUserMessage(error));
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.showToast('success', 'Tarefa concluida.');
        this.loadTasks(this.currentFilters);
      });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  showToast(type: ToastType, message: string): void {
    this.toast = { type, message };
  }

  private loadTasks(filters: Partial<TasksFiltersValue>): void {
    this.currentFilters = { ...defaultFilters, ...filters };

    this.tasksService
      .listTasks(this.currentFilters)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.showToast('error', this.errorService.getUserMessage(error));
          return EMPTY;
        })
      )
      .subscribe();
  }
}
