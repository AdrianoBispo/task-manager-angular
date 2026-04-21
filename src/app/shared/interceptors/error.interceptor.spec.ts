import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ErrorService } from '../services/error.service';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let errorService: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    errorService = TestBed.inject(ErrorService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should map HttpErrorResponse using ErrorService', () => {
    const mapErrorSpy = spyOn(errorService, 'mapError').and.callThrough();
    let capturedError: unknown;

    http.get('/api/tasks').subscribe({
      next: () => fail('Expected request to fail'),
      error: error => {
        capturedError = error;
      }
    });

    const req = httpMock.expectOne('/api/tasks');
    req.flush({ message: 'Token expirado' }, { status: 401, statusText: 'Unauthorized' });

    expect(mapErrorSpy).toHaveBeenCalled();
    expect(capturedError).toEqual(jasmine.objectContaining({
      statusCode: 401,
      message: 'Token expirado'
    }));
  });
});
