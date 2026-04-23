import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { provideRouter, Router } from '@angular/router';

import { AuthService } from '../../auth/services/auth.service';
import { User } from '../../shared/models/auth.model';
import { Task, TasksResponse, defaultFilters } from '../../shared/models/task.model';
import { ErrorService } from '../../shared/services/error.service';
import { TasksService } from '../services/tasks.service';
import { TasksComponent } from './tasks.component';

describe('TasksComponent', () => {
  let router: Router;
  let tasksService: jasmine.SpyObj<TasksService> & {
    tasks$: BehaviorSubject<Task[]>;
    meta$: BehaviorSubject<TasksResponse['meta'] | null>;
    isLoading$: BehaviorSubject<boolean>;
  };
  let authService: jasmine.SpyObj<AuthService>;
  let errorService: jasmine.SpyObj<ErrorService>;

  const task: Task = {
    id: 'task-1',
    id_usuario: 'user-1',
    titulo: 'Task teste',
    descricao: 'Descricao',
    status: 'PENDENTE',
    prioridade: 'MEDIA',
    data_criacao: '2026-04-23T10:00:00Z',
    data_atualizacao: '2026-04-23T10:00:00Z'
  };

  beforeEach(async () => {
    tasksService = jasmine.createSpyObj<TasksService>('TasksService', [
      'listTasks',
      'createTask',
      'updateTask',
      'deleteTask'
    ]) as typeof tasksService;

    tasksService.tasks$ = new BehaviorSubject<Task[]>([task]);
    tasksService.meta$ = new BehaviorSubject<TasksResponse['meta'] | null>({
      total_itens: 1,
      total_paginas: 1,
      pagina_atual: 1,
      itens_por_pagina: 10
    });
    tasksService.isLoading$ = new BehaviorSubject<boolean>(false);

    tasksService.listTasks.and.returnValue(
      of({
        dados: [task],
        meta: {
          total_itens: 1,
          total_paginas: 1,
          pagina_atual: 1,
          itens_por_pagina: 10
        }
      })
    );
    tasksService.createTask.and.returnValue(of(task));
    tasksService.updateTask.and.returnValue(of({ ...task, status: 'CONCLUIDA' }));
    tasksService.deleteTask.and.returnValue(of(void 0));

    authService = jasmine.createSpyObj<AuthService>('AuthService', ['logout']);
    (authService as unknown as { user$: BehaviorSubject<User | null> }).user$ = new BehaviorSubject<User | null>({
      id: 'user-1',
      nome: 'Usuario',
      email: 'user@example.com'
    });

    errorService = jasmine.createSpyObj<ErrorService>('ErrorService', ['getUserMessage']);
    errorService.getUserMessage.and.returnValue('Erro inesperado');

    await TestBed.configureTestingModule({
      imports: [TasksComponent],
      providers: [
        provideRouter([]),
        { provide: TasksService, useValue: tasksService },
        { provide: AuthService, useValue: authService },
        { provide: ErrorService, useValue: errorService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });

  it('should load tasks on init', () => {
    const fixture = TestBed.createComponent(TasksComponent);
    fixture.detectChanges();

    expect(tasksService.listTasks).toHaveBeenCalledWith(defaultFilters);
  });

  it('should open create form mode', () => {
    const fixture = TestBed.createComponent(TasksComponent);
    const component = fixture.componentInstance;

    component.onCreateTask();

    expect(component.isFormOpen).toBeTrue();
    expect(component.editingTask).toBeNull();
  });

  it('should open edit mode with selected task', () => {
    const fixture = TestBed.createComponent(TasksComponent);
    const component = fixture.componentInstance;

    component.onEditTask(task);

    expect(component.isFormOpen).toBeTrue();
    expect(component.editingTask).toEqual(task);
  });

  it('should call createTask on save when task is not being edited', () => {
    const fixture = TestBed.createComponent(TasksComponent);
    const component = fixture.componentInstance;

    component.onSaveTask({
      titulo: 'Nova tarefa',
      descricao: 'Descricao',
      status: 'PENDENTE',
      prioridade: 'MEDIA'
    });

    expect(tasksService.createTask).toHaveBeenCalled();
    expect(tasksService.updateTask).not.toHaveBeenCalled();
  });

  it('should call updateTask on save when task is being edited', () => {
    const fixture = TestBed.createComponent(TasksComponent);
    const component = fixture.componentInstance;

    component.editingTask = task;
    component.onSaveTask({
      titulo: 'Task atualizada',
      status: 'EM_ANDAMENTO'
    });

    expect(tasksService.updateTask).toHaveBeenCalledWith(task.id, {
      titulo: 'Task atualizada',
      status: 'EM_ANDAMENTO'
    });
  });

  it('should ask confirmation and call deleteTask', () => {
    const fixture = TestBed.createComponent(TasksComponent);
    const component = fixture.componentInstance;

    spyOn(window, 'confirm').and.returnValue(true);

    component.onDeleteTask(task.id);

    expect(tasksService.deleteTask).toHaveBeenCalledWith(task.id);
  });

  it('should mark task as completed', () => {
    const fixture = TestBed.createComponent(TasksComponent);
    const component = fixture.componentInstance;

    component.onMarkComplete(task);

    expect(tasksService.updateTask).toHaveBeenCalledWith(task.id, { status: 'CONCLUIDA' });
  });

  it('should logout user and navigate to login route', () => {
    const fixture = TestBed.createComponent(TasksComponent);
    const component = fixture.componentInstance;

    component.onLogout();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
