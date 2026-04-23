import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Task } from '../../../shared/models/task.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskItemComponent {
  @Input({ required: true }) task!: Task;

  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<string>();
  @Output() complete = new EventEmitter<Task>();

  onEdit(): void {
    this.edit.emit(this.task);
  }

  onDelete(): void {
    this.delete.emit(this.task.id);
  }

  onComplete(): void {
    this.complete.emit(this.task);
  }

  statusLabel(status: Task['status']): string {
    const labels: Record<Task['status'], string> = {
      PENDENTE: 'Pendente',
      EM_ANDAMENTO: 'Em andamento',
      CONCLUIDA: 'Concluida'
    };

    return labels[status];
  }

  priorityLabel(prioridade: Task['prioridade']): string {
    const labels: Record<Task['prioridade'], string> = {
      BAIXA: 'Baixa',
      MEDIA: 'Media',
      ALTA: 'Alta'
    };

    return labels[prioridade];
  }
}
