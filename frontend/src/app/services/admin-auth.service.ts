import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AdminRoleService } from './admin-role.service';

export interface LoginResponse {
  token: string;
  role?: string;
  userId?: string;
  nombre?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  constructor(
    private api: ApiService,
    private router: Router,
    private roleService: AdminRoleService
  ) {}

  login(username: string, password: string) {
    return this.api.post<LoginResponse>('/admin/auth/login', { username, password }).pipe(
      tap(res => {
        localStorage.setItem('adminToken', res.token);
        if (res.nombre) {
          localStorage.setItem('adminName', res.nombre);
        }
        if (res.userId) {
          this.roleService.setUserData(
            res.userId,
            (res.role as any) || 'ADMIN_GENERAL'
          );
        } else {
          this.roleService.refresh();
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.roleService.clear();
    this.router.navigate(['/admin/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('adminToken');
  }
}

