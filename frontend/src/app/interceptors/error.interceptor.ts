import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const isAdmin = req.url.includes('/api/admin/');
        if (isAdmin) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminName');
          router.navigate(['/admin/login']);
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        } else {
          localStorage.removeItem('gradToken');
          localStorage.removeItem('graduateId');
          router.navigate(['/']);
          toast.error('Sesión expirada. Por favor, identifícate nuevamente.');
        }
      } else if (error.status === 403) {
        toast.error('No tienes permisos para realizar esta acción.');
      } else if (error.status === 404) {
        toast.error('Recurso no encontrado.');
      } else if (error.status >= 500) {
        const message = error.error?.error || 'Error del servidor. Por favor, intenta más tarde.';
        toast.error(message);
      } else if (error.error?.error) {
        toast.error(error.error.error);
      } else {
        toast.error('Ocurrió un error. Por favor, intenta nuevamente.');
      }
      return throwError(() => error);
    })
  );
};



