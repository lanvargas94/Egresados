import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast.service';

export const adminGuard: CanActivateFn = () => {
  const token = localStorage.getItem('adminToken');
  const router = inject(Router);
  const toast = inject(ToastService);
  if (!token) {
    toast.error('Necesitas iniciar sesión como Admin');
    return router.parseUrl('/admin/login');
  }
  return true;
};

