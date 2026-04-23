import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

import {
  Task,
  TasksFiltersValue,
  TasksResponse,
  UpsertTaskPayload,
  defaultFilters
} from '../../shared/models/task.model';
import { HttpService } from '../../shared/services/http.service';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);
  private readonly metaSubject = new BehaviorSubject<TasksResponse['meta'] | null>(null);
  private readonly isLoadingSubject = new BehaviorSubject<boolean>(false);

  readonly tasks$ = this.tasksSubject.asObservable();
  readonly meta$ = this.metaSubject.asObservable();
  readonly isLoading$ = this.isLoadingSubject.asObservable();

  constructor(private readonly http: HttpService) {}

  listTasks(filters: Partial<TasksFiltersValue> = defaultFilters): Observable<TasksResponse> {
    const mergedFilters: TasksFiltersValue = { ...defaultFilters, ...filters };

    this.isLoadingSubject.next(true);

    return this.http
      .get<TasksResponse>('/api/tasks', {
        params: this.toHttpParams(mergedFilters)
      })
      .pipe(
        tap(response => {
          this.tasksSubject.next(response.dados);
          this.metaSubject.next(response.meta);
        }),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }

  createTask(payload: UpsertTaskPayload): Observable<Task> {
    return this.http.post<Task, UpsertTaskPayload>('/api/tasks', payload).pipe(
      tap(task => {
        this.tasksSubject.next([task, ...this.tasksSubject.value]);
      })
    );
  }

  updateTask(id: string, payload: Partial<UpsertTaskPayload>): Observable<Task> {
    return this.http.patch<Task, Partial<UpsertTaskPayload>>(`/api/tasks/${id}`, payload).pipe(
      tap(updatedTask => {
        const nextState = this.tasksSubject.value.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        );

        this.tasksSubject.next(nextState);
      })
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`/api/tasks/${id}`).pipe(
      tap(() => {
        const nextState = this.tasksSubject.value.filter(task => task.id !== id);
        this.tasksSubject.next(nextState);
      })
    );
  }

  toHttpParams(filters: Partial<TasksFiltersValue>): HttpParams {
    let params = new HttpParams();

    if (filters.q && filters.q.trim()) {
      params = params.set('q', filters.q.trim());
    }

    if (filters.status && filters.status !== 'TODOS') {
      params = params.set('status', filters.status);
    }

    if (filters.prioridade && filters.prioridade !== 'TODAS') {
      params = params.set('prioridade', filters.prioridade);
    }

    if (filters.sort) {
      params = params.set('sort', filters.sort);
    }

    if (typeof filters.page === 'number' && filters.page >= 1) {
      params = params.set('page', String(filters.page));
    }

    if (typeof filters.limit === 'number' && filters.limit >= 1) {
      params = params.set('limit', String(filters.limit));
    }

    return params;
  }
}
