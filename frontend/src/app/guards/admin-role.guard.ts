import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AdminRoleService, AdminRole } from '../services/admin-role.service';
import { ToastService } from '../services/toast.service';

export const adminRoleGuard = (requiredRole: AdminRole | 'BOTH' = 'BOTH'): CanActivateFn => {
  return () => {
    const roleService = inject(AdminRoleService);
    const router = inject(Router);
    const toast = inject(ToastService);

    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error('Necesitas iniciar sesión como Admin');
      return router.parseUrl('/admin/login');
    }

    if (!roleService.hasAccess(requiredRole)) {
      toast.error('No tienes permisos para acceder a esta sección');
      return router.parseUrl('/admin');
    }

    return true;
  };
};



