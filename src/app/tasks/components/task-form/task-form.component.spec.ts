import { SimpleChange } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Task } from '../../../shared/models/task.model';
import { TaskFormComponent } from './task-form.component';

describe('TaskFormComponent', () => {
  const baseTask: Task = {
    id: 'task-1',
    id_usuario: 'user-1',
    titulo: 'Task editada',
    descricao: 'Descricao editada',
    status: 'EM_ANDAMENTO',
    prioridade: 'ALTA',
    data_vencimento: '2026-05-01',
    data_criacao: '2026-04-23T10:00:00Z',
    data_atualizacao: '2026-04-23T10:00:00Z'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent]
    }).compileComponents();
  });

  it('should validate title with min length 3', () => {
    const fixture = TestBed.createComponent(TaskFormComponent);
    const component = fixture.componentInstance;

    component.form.controls.titulo.setValue('ab');

    expect(component.form.controls.titulo.invalid).toBeTrue();
    expect(component.form.controls.titulo.errors).toEqual(
      jasmine.objectContaining({ minlength: jasmine.any(Object) })
    );
  });

  it('should patch form when task input changes (edit mode)', () => {
    const fixture = TestBed.createComponent(TaskFormComponent);
    const component = fixture.componentInstance;

    component.task = baseTask;
    component.ngOnChanges({
      task: new SimpleChange(null, baseTask, true)
    });

    expect(component.form.getRawValue().titulo).toBe('Task editada');
    expect(component.form.getRawValue().status).toBe('EM_ANDAMENTO');
  });

  it('should emit save payload when form is valid', () => {
    const fixture = TestBed.createComponent(TaskFormComponent);
    const component = fixture.componentInstance;

    spyOn(component.save, 'emit');

    component.form.setValue({
      titulo: 'Nova task',
      descricao: '  detalhe  ',
      status: 'PENDENTE',
      prioridade: 'MEDIA',
      data_vencimento: null
    });

    component.onSubmit();

    expect(component.save.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        titulo: 'Nova task',
        descricao: 'detalhe',
        status: 'PENDENTE',
        prioridade: 'MEDIA'
      })
    );
  });

  it('should disable controls while isSubmitting is true', () => {
    const fixture = TestBed.createComponent(TaskFormComponent);
    const component = fixture.componentInstance;

    component.isSubmitting = true;
    component.ngOnChanges({
      isSubmitting: new SimpleChange(false, true, false)
    });

    expect(component.form.disabled).toBeTrue();

    component.isSubmitting = false;
    component.ngOnChanges({
      isSubmitting: new SimpleChange(true, false, false)
    });

    expect(component.form.enabled).toBeTrue();
  });

  it('should emit cancel output', () => {
    const fixture = TestBed.createComponent(TaskFormComponent);
    const component = fixture.componentInstance;

    spyOn(component.cancel, 'emit');

    component.onCancel();

    expect(component.cancel.emit).toHaveBeenCalled();
  });
});
