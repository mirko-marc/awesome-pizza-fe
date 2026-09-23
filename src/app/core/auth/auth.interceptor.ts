import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from './auth.store';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const isAdminRequest = request.url.includes('/api/v1/admin');
  const accessToken = authStore.accessToken();
  const authenticatedRequest = isAdminRequest && accessToken
    ? request.clone({ setHeaders: { Authorization: `${authStore.tokenType()} ${accessToken}` } })
    : request;

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      if (isAdminRequest && error instanceof HttpErrorResponse && error.status === 401) {
        authStore.logout();
        void router.navigate(['/admin/login'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => error);
    }),
  );
};
