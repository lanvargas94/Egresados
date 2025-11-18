import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const onboardingGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  const id = auth.getGraduateId();
  if (!id) {
    toast.error('Tu sesión ha expirado. Vuelve a identificarte.');
    return router.parseUrl('/');
  }
  return true;
};

