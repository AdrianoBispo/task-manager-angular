import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  HttpErrorPattern,
  HttpErrorBody,
  DEFAULT_HTTP_ERROR_PATTERNS,
  ErrorFieldMap
} from '../models/common.model';

/**
 * Service responsável por mapear e formatar erros HTTP em mensagens amigáveis.
 * Centraliza a lógica de tratamento e exibição de erros para toda a aplicação.
 */
@Injectable({ providedIn: 'root' })
export class ErrorService {
  private patterns: Map<number, HttpErrorPattern>;

  constructor() {
    this.patterns = new Map(DEFAULT_HTTP_ERROR_PATTERNS.map(p => [p.status, p]));
  }

  /**
   * Mapeia um HttpErrorResponse para uma mensagem de erro amigável.
   * Extrai a mensagem do servidor ou usa fallback baseado no status HTTP.
   */
  mapError(error: HttpErrorResponse): HttpErrorBody {
    if (!error) {
      return { message: 'Erro desconhecido', statusCode: 0 };
    }

    const statusCode = error.status || 0;
    const pattern = this.patterns.get(statusCode);

    // Tenta extrair mensagem do response body
    const serverMessage = this.extractServerMessage(error.error);

    return {
      statusCode,
      status: statusCode,
      message: serverMessage || pattern?.message || 'Erro inesperado',
      error: error.error?.error || error.statusText,
      path: error.url || undefined,
      timestamp: new Date().toISOString(),
      details: serverMessage || undefined,
      errors: error.error?.errors
    };
  }

  /**
   * Retorna uma mensagem amigável para exibição no UI baseada no status HTTP.
   */
  getUserMessage(error: HttpErrorResponse | HttpErrorBody): string {
    let statusCode: number;

    if (error instanceof HttpErrorResponse) {
      statusCode = error.status || 0;
    } else {
      statusCode = error.statusCode || error.status || 0;
    }

    const pattern = this.patterns.get(statusCode);
    return pattern?.fallbackMessage || 'Ocorreu um erro inesperado. Tente novamente.';
  }

  /**
   * Extrai erros de validação de um response.
   * Útil para exibir mensagens específicas por campo em formulários.
   */
  extractValidationErrors(error: HttpErrorBody): ErrorFieldMap | null {
    if (!error.errors) {
      return null;
    }

    // Se errors já é um objeto de campo -> valor, retorna direto
    if (typeof error.errors === 'object' && !Array.isArray(error.errors)) {
      return error.errors as ErrorFieldMap;
    }

    // Se é um array ou string, retorna null (não é estruturado por campo)
    return null;
  }

  /**
   * Verifica se um erro é de validação (422 ou 400 com campo errors).
   */
  isValidationError(error: HttpErrorBody): boolean {
    return (
      error.status === 422 ||
      (error.status === 400 && error.errors !== undefined)
    );
  }

  /**
   * Verifica se um erro é de autenticação (401).
   */
  isAuthenticationError(error: HttpErrorBody | HttpErrorResponse): boolean {
    if (error instanceof HttpErrorResponse) {
      return error.status === 401;
    }
    return error.status === 401 || error.statusCode === 401;
  }

  /**
   * Verifica se um erro é de autorização (403).
   */
  isAuthorizationError(error: HttpErrorBody | HttpErrorResponse): boolean {
    if (error instanceof HttpErrorResponse) {
      return error.status === 403;
    }
    return error.status === 403 || error.statusCode === 403;
  }

  /**
   * Verifica se um erro é de recurso não encontrado (404).
   */
  isNotFoundError(error: HttpErrorBody | HttpErrorResponse): boolean {
    if (error instanceof HttpErrorResponse) {
      return error.status === 404;
    }
    return error.status === 404 || error.statusCode === 404;
  }

  /**
   * Verifica se é um erro de conexão (status 0).
   */
  isNetworkError(error: HttpErrorBody | HttpErrorResponse): boolean {
    if (error instanceof HttpErrorResponse) {
      return error.status === 0;
    }
    return error.status === 0 || error.statusCode === 0;
  }

  /**
   * Registra um padrão de erro customizado.
   * Permite override de comportamento padrão por status code.
   */
  registerPattern(pattern: HttpErrorPattern): void {
    this.patterns.set(pattern.status, pattern);
  }

  /**
   * Extrai mensagem do response body do servidor.
   * Suporta diferentes formatos de resposta de erro.
   */
  private extractServerMessage(body: any): string | null {
    if (!body) {
      return null;
    }

    // Formato 1: { message: "..." }
    if (typeof body.message === 'string') {
      return body.message;
    }

    // Formato 2: { error: "..." }
    if (typeof body.error === 'string') {
      return body.error;
    }

    // Formato 3: { details: "..." }
    if (typeof body.details === 'string') {
      return body.details;
    }

    // Formato 4: { errors: [...] } - retorna primeiro erro se array
    if (Array.isArray(body.errors) && body.errors.length > 0) {
      return String(body.errors[0]);
    }

    return null;
  }
}
