import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Task, TasksResponse, UpsertTaskPayload, defaultFilters } from '../../shared/models/task.model';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let httpMock: HttpTestingController;

  const baseTask: Task = {
    id: 'task-1',
    id_usuario: 'user-1',
    titulo: 'Primeira tarefa',
    descricao: 'Descricao',
    status: 'PENDENTE',
    prioridade: 'MEDIA',
    data_criacao: '2026-04-23T10:00:00Z',
    data_atualizacao: '2026-04-23T10:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(TasksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should list tasks and update tasks/meta state', () => {
    const response: TasksResponse = {
      dados: [baseTask],
      meta: {
        total_itens: 1,
        total_paginas: 1,
        pagina_atual: 1,
        itens_por_pagina: 10
      }
    };

    let tasksSnapshot: Task[] = [];
    let metaSnapshot: TasksResponse['meta'] | undefined;

    service.tasks$.subscribe(tasks => {
      tasksSnapshot = tasks;
    });

    service.meta$.subscribe((meta: TasksResponse['meta'] | null) => {
      if (meta) {
        metaSnapshot = meta;
      }
    });

    service.listTasks(defaultFilters).subscribe();

    const req = httpMock.expectOne(request => request.url === 'http://localhost:8080/api/tasks');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.params.get('sort')).toBe('-data_criacao');
    req.flush(response);

    expect(tasksSnapshot).toEqual([baseTask]);
    expect(metaSnapshot).toBeDefined();
    expect(metaSnapshot?.total_itens).toBe(1);
    expect(metaSnapshot?.pagina_atual).toBe(1);
  });

  it('should create a task and prepend it to state', () => {
    const payload: UpsertTaskPayload = {
      titulo: 'Nova tarefa',
      descricao: 'Nova descricao',
      prioridade: 'ALTA'
    };

    const createdTask: Task = {
      ...baseTask,
      id: 'task-2',
      titulo: 'Nova tarefa',
      prioridade: 'ALTA'
    };

    let tasksSnapshot: Task[] = [];
    service.tasks$.subscribe(tasks => {
      tasksSnapshot = tasks;
    });

    service.createTask(payload).subscribe(task => {
      expect(task).toEqual(createdTask);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/tasks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(createdTask);

    expect(tasksSnapshot[0]).toEqual(createdTask);
  });

  it('should update a task in state by id', () => {
    const response: TasksResponse = {
      dados: [baseTask],
      meta: {
        total_itens: 1,
        total_paginas: 1,
        pagina_atual: 1,
        itens_por_pagina: 10
      }
    };

    service.listTasks(defaultFilters).subscribe();
    const listReq = httpMock.expectOne(request => request.url === 'http://localhost:8080/api/tasks');
    expect(listReq.request.method).toBe('GET');
    expect(listReq.request.params.get('page')).toBe('1');
    expect(listReq.request.params.get('limit')).toBe('10');
    expect(listReq.request.params.get('sort')).toBe('-data_criacao');
    listReq.flush(response);

    const updatedTask: Task = {
      ...baseTask,
      titulo: 'Titulo atualizado',
      status: 'EM_ANDAMENTO'
    };

    let tasksSnapshot: Task[] = [];
    service.tasks$.subscribe(tasks => {
      tasksSnapshot = tasks;
    });

    service.updateTask(baseTask.id, { titulo: updatedTask.titulo, status: updatedTask.status }).subscribe();

    const req = httpMock.expectOne(`http://localhost:8080/api/tasks/${baseTask.id}`);
    expect(req.request.method).toBe('PATCH');
    req.flush(updatedTask);

    expect(tasksSnapshot[0].titulo).toBe('Titulo atualizado');
    expect(tasksSnapshot[0].status).toBe('EM_ANDAMENTO');
  });

  it('should delete task from state', () => {
    const response: TasksResponse = {
      dados: [baseTask],
      meta: {
        total_itens: 1,
        total_paginas: 1,
        pagina_atual: 1,
        itens_por_pagina: 10
      }
    };

    service.listTasks(defaultFilters).subscribe();
    const listReq = httpMock.expectOne(request => request.url === 'http://localhost:8080/api/tasks');
    expect(listReq.request.method).toBe('GET');
    expect(listReq.request.params.get('page')).toBe('1');
    expect(listReq.request.params.get('limit')).toBe('10');
    expect(listReq.request.params.get('sort')).toBe('-data_criacao');
    listReq.flush(response);

    let tasksSnapshot: Task[] = [];
    service.tasks$.subscribe(tasks => {
      tasksSnapshot = tasks;
    });

    service.deleteTask(baseTask.id).subscribe();

    const req = httpMock.expectOne(`http://localhost:8080/api/tasks/${baseTask.id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(tasksSnapshot).toEqual([]);
  });

  it('should convert filters to HttpParams excluding TODOS and TODAS', () => {
    const params = service.toHttpParams({
      q: '  teste  ',
      status: 'TODOS',
      prioridade: 'ALTA',
      sort: 'data_vencimento',
      page: 2,
      limit: 5
    });

    expect(params.get('q')).toBe('teste');
    expect(params.get('status')).toBeNull();
    expect(params.get('prioridade')).toBe('ALTA');
    expect(params.get('sort')).toBe('data_vencimento');
    expect(params.get('page')).toBe('2');
    expect(params.get('limit')).toBe('5');
  });
});
