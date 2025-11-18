import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Usa token admin para rutas /api/admin, de lo contrario token GRAD
  const isAdmin = req.url.includes('/api/admin/');
  const token = isAdmin ? localStorage.getItem('adminToken') : localStorage.getItem('gradToken');
  if (token) {
    const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next(cloned);
  }
  return next(req);
};
