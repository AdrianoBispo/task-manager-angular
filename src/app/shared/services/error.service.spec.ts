import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from './error.service';

describe('ErrorService', () => {
  let service: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('mapError()', () => {
    it('should map a 401 error with server message', () => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Token inválido' },
        status: 401,
        statusText: 'Unauthorized'
      });

      const result = service.mapError(errorResponse);

      expect(result.statusCode).toBe(401);
      expect(result.message).toBe('Token inválido');
      expect(result.status).toBe(401);
    });

    it('should use fallback message when server message is missing', () => {
      const errorResponse = new HttpErrorResponse({
        error: {},
        status: 401,
        statusText: 'Unauthorized'
      });

      const result = service.mapError(errorResponse);

      expect(result.statusCode).toBe(401);
      expect(result.message).toBe('Não autenticado');
    });

    it('should handle 422 validation errors', () => {
      const errorResponse = new HttpErrorResponse({
        error: {
          message: 'Validation failed',
          errors: { email: 'Email já existe', password: 'Senha muito curta' }
        },
        status: 422,
        statusText: 'Unprocessable Entity'
      });

      const result = service.mapError(errorResponse);

      expect(result.statusCode).toBe(422);
      expect(result.errors).toEqual({
        email: 'Email já existe',
        password: 'Senha muito curta'
      });
    });

    it('should handle network errors (status 0)', () => {
      const errorResponse = new HttpErrorResponse({
        error: null,
        status: 0,
        statusText: ''
      });

      const result = service.mapError(errorResponse);

      expect(result.statusCode).toBe(0);
      expect(result.message).toBe('Falha de conexão');
    });

    it('should handle null error gracefully', () => {
      const result = service.mapError(null as any);

      expect(result.message).toBe('Erro desconhecido');
      expect(result.statusCode).toBe(0);
    });
  });

  describe('getUserMessage()', () => {
    it('should return 401 user message', () => {
      const errorResponse = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized'
      });

      const message = service.getUserMessage(errorResponse);

      expect(message).toBe('Faça login novamente para continuar.');
    });

    it('should return 400 user message', () => {
      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request'
      });

      const message = service.getUserMessage(errorResponse);

      expect(message).toBe('Verifique os dados informados.');
    });

    it('should return 404 user message', () => {
      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found'
      });

      const message = service.getUserMessage(errorResponse);

      expect(message).toBe('O recurso solicitado não foi encontrado.');
    });

    it('should return generic message for unknown status', () => {
      const errorResponse = new HttpErrorResponse({
        status: 999,
        statusText: 'Unknown'
      });

      const message = service.getUserMessage(errorResponse);

      expect(message).toBe('Ocorreu um erro inesperado. Tente novamente.');
    });

    it('should work with HttpErrorBody object', () => {
      const errorBody = {
        status: 403,
        message: 'Forbidden'
      };

      const message = service.getUserMessage(errorBody);

      expect(message).toBe('Você não tem permissão para executar esta ação.');
    });
  });

  describe('extractValidationErrors()', () => {
    it('should extract field validation errors', () => {
      const errorBody = {
        status: 422,
        errors: { email: 'Inválido', password: 'Muito curto' }
      };

      const result = service.extractValidationErrors(errorBody);

      expect(result).toEqual({
        email: 'Inválido',
        password: 'Muito curto'
      });
    });

    it('should return null when errors is array', () => {
      const errorBody = {
        status: 400,
        errors: ['Erro 1', 'Erro 2']
      };

      const result = service.extractValidationErrors(errorBody as any);

      expect(result).toBeNull();
    });

    it('should return null when no errors', () => {
      const errorBody = { status: 400 };

      const result = service.extractValidationErrors(errorBody);

      expect(result).toBeNull();
    });
  });

  describe('error type checking methods', () => {
    it('should identify authentication errors', () => {
      const errorResponse = new HttpErrorResponse({ status: 401 });
      const errorBody = { status: 401 };

      expect(service.isAuthenticationError(errorResponse)).toBe(true);
      expect(service.isAuthenticationError(errorBody)).toBe(true);
    });

    it('should identify authorization errors', () => {
      const errorResponse = new HttpErrorResponse({ status: 403 });
      const errorBody = { status: 403 };

      expect(service.isAuthorizationError(errorResponse)).toBe(true);
      expect(service.isAuthorizationError(errorBody)).toBe(true);
    });

    it('should identify not found errors', () => {
      const errorResponse = new HttpErrorResponse({ status: 404 });
      const errorBody = { status: 404 };

      expect(service.isNotFoundError(errorResponse)).toBe(true);
      expect(service.isNotFoundError(errorBody)).toBe(true);
    });

    it('should identify network errors', () => {
      const errorResponse = new HttpErrorResponse({ status: 0 });
      const errorBody = { status: 0 };

      expect(service.isNetworkError(errorResponse)).toBe(true);
      expect(service.isNetworkError(errorBody)).toBe(true);
    });

    it('should identify validation errors', () => {
      const errorBody422 = { status: 422 };
      const errorBody400 = { status: 400, errors: { field: 'error' } };

      expect(service.isValidationError(errorBody422)).toBe(true);
      expect(service.isValidationError(errorBody400)).toBe(true);
    });
  });

  describe('registerPattern()', () => {
    it('should register custom error pattern', () => {
      const customPattern = {
        status: 999,
        message: 'Custom Error',
        fallbackMessage: 'Erro customizado'
      };

      service.registerPattern(customPattern);

      const errorResponse = new HttpErrorResponse({
        error: {},
        status: 999
      });

      const message = service.getUserMessage(errorResponse);
      expect(message).toBe('Erro customizado');
    });
  });
});
