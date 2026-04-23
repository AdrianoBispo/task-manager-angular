import { TestBed } from '@angular/core/testing';

import { Task } from '../../../shared/models/task.model';
import { TaskItemComponent } from './task-item.component';

describe('TaskItemComponent', () => {
  const task: Task = {
    id: 'task-1',
    id_usuario: 'user-1',
    titulo: 'Tarefa de teste',
    descricao: 'Descricao de teste',
    status: 'PENDENTE',
    prioridade: 'MEDIA',
    data_criacao: '2026-04-23T10:00:00Z',
    data_atualizacao: '2026-04-23T10:00:00Z'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskItemComponent]
    }).compileComponents();
  });

  it('should render task title and badges', () => {
    const fixture = TestBed.createComponent(TaskItemComponent);
    fixture.componentInstance.task = task;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Tarefa de teste');
    expect(compiled.textContent).toContain('Pendente');
    expect(compiled.textContent).toContain('Media');
  });

  it('should emit edit, delete and complete events', () => {
    const fixture = TestBed.createComponent(TaskItemComponent);
    const component = fixture.componentInstance;

    component.task = task;
    fixture.detectChanges();

    spyOn(component.edit, 'emit');
    spyOn(component.delete, 'emit');
    spyOn(component.complete, 'emit');

    component.onEdit();
    component.onDelete();
    component.onComplete();

    expect(component.edit.emit).toHaveBeenCalledWith(task);
    expect(component.delete.emit).toHaveBeenCalledWith(task.id);
    expect(component.complete.emit).toHaveBeenCalledWith(task);
  });
});
