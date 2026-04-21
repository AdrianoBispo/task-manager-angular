export interface Task {
  id: string;
  id_usuario: string;
  titulo: string;
  descricao?: string;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA';
  data_vencimento?: string;
  data_criacao: string;
  data_atualizacao: string;
  data_conclusao?: string;
}

export interface UpsertTaskPayload {
  titulo: string;
  descricao?: string;
  status?: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  prioridade?: 'BAIXA' | 'MEDIA' | 'ALTA';
  data_vencimento?: string;
}

export interface TasksFiltersValue {
  q: string;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'TODOS';
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'TODAS';
  sort: 'data_criacao' | '-data_criacao' | 'data_vencimento' | '-data_vencimento';
  page: number;
  limit: number;
}

export interface TasksResponse {
  dados: Task[];
  meta: {
    total_itens: number;
    total_paginas: number;
    pagina_atual: number;
    itens_por_pagina: number;
  };
}

export const defaultFilters: TasksFiltersValue = {
  q: '',
  status: 'TODOS',
  prioridade: 'TODAS',
  sort: '-data_criacao',
  page: 1,
  limit: 10
};
