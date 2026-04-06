import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Intercepts every HTTP request.
 * - For /api/quantity/** routes: automatically attaches Bearer token header
 * - On 401 / 403: clears token and redirects to /login
 *
 * Note: /auth/** endpoints are public (permitAll() in Auth Service SecurityConfig)
 * so no token is needed for signup/login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Clone request with Authorization header if token exists and request targets /api/
  let clonedReq = req;
  if (token && req.url.includes('/api/')) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 Unauthorized: token expired or invalid (JwtFilter returns 401)
      // 403 Forbidden: authenticated but not authorized
      if (error.status === 401 || error.status === 403) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
