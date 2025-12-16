import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface AdminUser {
  id: string;
  username: string;
  nombre?: string;
  correo?: string;
  role: 'ADMIN_GENERAL' | 'ADMIN_PROGRAMA';
  programasAsignados?: string[];
  activo: boolean;
  creadoEn?: string;
  ultimoAcceso?: string;
}

export interface AdminUserListResponse {
  items: AdminUser[];
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  constructor(private api: ApiService) {}

  list(): Observable<AdminUserListResponse> {
    return this.api.get<AdminUserListResponse>('/admin/users');
  }

  get(id: string): Observable<AdminUser> {
    return this.api.get<AdminUser>(`/admin/users/${id}`);
  }

  create(data: {
    username: string;
    password: string;
    nombre?: string;
    correo?: string;
    role: 'ADMIN_GENERAL' | 'ADMIN_PROGRAMA';
    programasAsignados?: string[];
  }): Observable<AdminUser> {
    return this.api.post<AdminUser>('/admin/users', data);
  }

  update(id: string, data: {
    nombre?: string;
    correo?: string;
    role?: 'ADMIN_GENERAL' | 'ADMIN_PROGRAMA';
    programasAsignados?: string[];
    activo?: boolean;
    newPassword?: string;
  }): Observable<AdminUser> {
    return this.api.put<AdminUser>(`/admin/users/${id}`, data);
  }

  deactivate(id: string): Observable<AdminUser> {
    return this.api.put<AdminUser>(`/admin/users/${id}/deactivate`, {});
  }
}






