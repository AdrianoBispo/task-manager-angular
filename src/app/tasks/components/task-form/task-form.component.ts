import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  FormBuilder,
  Validators
} from '@angular/forms';

import { Task, UpsertTaskPayload } from '../../../shared/models/task.model';

const validDateValidator: ValidatorFn = (
  control: AbstractControl<string | null>
): ValidationErrors | null => {
  const value = control.value;

  if (!value) {
    return null;
  }

  return Number.isNaN(Date.parse(value)) ? { invalidDate: true } : null;
};

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() task: Task | null = null;
  @Input() isSubmitting = false;

  @Output() save = new EventEmitter<UpsertTaskPayload>();
  @Output() cancel = new EventEmitter<void>();

  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(3)]],
    descricao: [''],
    status: ['PENDENTE' as Task['status']],
    prioridade: ['MEDIA' as Task['prioridade']],
    data_vencimento: this.fb.control<string | null>(null, [validDateValidator])
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task']) {
      this.patchFormFromTask();
    }

    if (changes['isSubmitting']) {
      if (this.isSubmitting) {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const payload: UpsertTaskPayload = {
      titulo: raw.titulo.trim(),
      descricao: raw.descricao.trim() || undefined,
      status: raw.status,
      prioridade: raw.prioridade,
      data_vencimento: raw.data_vencimento || undefined
    };

    this.save.emit(payload);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private patchFormFromTask(): void {
    if (!this.task) {
      this.form.reset({
        titulo: '',
        descricao: '',
        status: 'PENDENTE',
        prioridade: 'MEDIA',
        data_vencimento: null
      });
      return;
    }

    this.form.reset({
      titulo: this.task.titulo,
      descricao: this.task.descricao ?? '',
      status: this.task.status,
      prioridade: this.task.prioridade,
      data_vencimento: this.task.data_vencimento ?? null
    });
  }
}
