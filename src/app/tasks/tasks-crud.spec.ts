import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Task, TasksResponse, UpsertTaskPayload, defaultFilters } from '../shared/models/task.model';
import { TasksService } from './services/tasks.service';

describe('Tasks CRUD integration', () => {
  let tasksService: TasksService;
  let httpMock: HttpTestingController;

  const task: Task = {
    id: 'task-1',
    id_usuario: 'user-1',
    titulo: 'Task inicial',
    descricao: 'Descricao inicial',
    status: 'PENDENTE',
    prioridade: 'MEDIA',
    data_criacao: '2026-04-23T10:00:00Z',
    data_atualizacao: '2026-04-23T10:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    tasksService = TestBed.inject(TasksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should execute list -> create -> update -> delete flow', () => {
    const listResponse: TasksResponse = {
      dados: [task],
      meta: {
        total_itens: 1,
        total_paginas: 1,
        pagina_atual: 1,
        itens_por_pagina: 10
      }
    };

    let listDone = false;
    tasksService.listTasks(defaultFilters).subscribe(response => {
      listDone = true;
      expect(response).toEqual(listResponse);
    });

    const listReq = httpMock.expectOne(request => request.url === 'http://localhost:8080/api/tasks');
    expect(listReq.request.method).toBe('GET');
    expect(listReq.request.params.get('page')).toBe('1');
    expect(listReq.request.params.get('limit')).toBe('10');
    expect(listReq.request.params.get('sort')).toBe('-data_criacao');
    listReq.flush(listResponse);

    const createPayload: UpsertTaskPayload = {
      titulo: 'Task criada',
      descricao: 'Descricao criada',
      status: 'PENDENTE',
      prioridade: 'ALTA'
    };

    const createdTask: Task = {
      ...task,
      id: 'task-2',
      titulo: 'Task criada',
      prioridade: 'ALTA'
    };

    let createDone = false;
    tasksService.createTask(createPayload).subscribe(response => {
      createDone = true;
      expect(response).toEqual(createdTask);
    });

    const createReq = httpMock.expectOne('http://localhost:8080/api/tasks');
    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.body).toEqual(createPayload);
    createReq.flush(createdTask);

    const updatedTask: Task = {
      ...createdTask,
      status: 'CONCLUIDA'
    };

    let updateDone = false;
    tasksService.updateTask(createdTask.id, { status: 'CONCLUIDA' }).subscribe(response => {
      updateDone = true;
      expect(response).toEqual(updatedTask);
    });

    const updateReq = httpMock.expectOne(`http://localhost:8080/api/tasks/${createdTask.id}`);
    expect(updateReq.request.method).toBe('PATCH');
    expect(updateReq.request.body).toEqual({ status: 'CONCLUIDA' });
    updateReq.flush(updatedTask);

    let deleteDone = false;
    tasksService.deleteTask(createdTask.id).subscribe(() => {
      deleteDone = true;
    });

    const deleteReq = httpMock.expectOne(`http://localhost:8080/api/tasks/${createdTask.id}`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);

    expect(listDone).toBeTrue();
    expect(createDone).toBeTrue();
    expect(updateDone).toBeTrue();
    expect(deleteDone).toBeTrue();
  });
});
