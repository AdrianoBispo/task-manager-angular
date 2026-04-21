export type Nullable<T> = T | null;

export type Maybe<T> = T | null | undefined;

export type Primitive = string | number | boolean | bigint | symbol | null | undefined;

export interface PaginationMeta {
  total_itens: number;
  total_paginas: number;
  pagina_atual: number;
  itens_por_pagina: number;
}

export interface ApiResponse<T> {
  dados: T;
  mensagem?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  dados: T[];
  meta: PaginationMeta;
}

export type ErrorDetailValue = string | string[] | number | boolean;

export type ErrorFieldMap = Record<string, ErrorDetailValue>;

export interface HttpErrorBody {
  message?: string;
  error?: string;
  statusCode?: number;
  status?: number;
  path?: string;
  timestamp?: string;
  details?: string;
  errors?: ErrorFieldMap | string[] | string;
}

export interface HttpErrorPattern {
  status: number;
  message: string;
  fallbackMessage: string;
  code?: string;
}

export type RequestState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadableState<T> {
  data: T | null;
  loading: boolean;
  error: HttpErrorBody | null;
}

export const DEFAULT_HTTP_ERROR_PATTERNS: HttpErrorPattern[] = [
  {
    status: 0,
    message: 'Falha de conexão',
    fallbackMessage: 'Não foi possível conectar ao servidor.'
  },
  {
    status: 400,
    message: 'Requisição inválida',
    fallbackMessage: 'Verifique os dados informados.'
  },
  {
    status: 401,
    message: 'Não autenticado',
    fallbackMessage: 'Faça login novamente para continuar.'
  },
  {
    status: 403,
    message: 'Acesso negado',
    fallbackMessage: 'Você não tem permissão para executar esta ação.'
  },
  {
    status: 404,
    message: 'Recurso não encontrado',
    fallbackMessage: 'O recurso solicitado não foi encontrado.'
  },
  {
    status: 409,
    message: 'Conflito',
    fallbackMessage: 'A operação não pôde ser concluída por conflito de dados.'
  },
  {
    status: 422,
    message: 'Dados inválidos',
    fallbackMessage: 'Corrija os campos destacados e tente novamente.'
  },
  {
    status: 500,
    message: 'Erro inesperado',
    fallbackMessage: 'Ocorreu um erro inesperado no servidor.'
  }
];