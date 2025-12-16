import { Injectable } from '@angular/core';

export type AdminRole = 'ADMIN_GENERAL' | 'ADMIN_PROGRAMA';

@Injectable({ providedIn: 'root' })
export class AdminRoleService {
  private cachedRole: AdminRole | null = null;
  private cachedUserId: string | null = null;
  private cachedProgramas: string[] = [];

  constructor() {
    this.loadFromToken();
  }

  private loadFromToken() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      this.cachedRole = null;
      this.cachedUserId = null;
      this.cachedProgramas = [];
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.cachedRole = payload.role || 'ADMIN_GENERAL';
      this.cachedUserId = payload.sub || null;
    } catch (e) {
      this.cachedRole = null;
      this.cachedUserId = null;
    }

    // Cargar programas asignados del localStorage si existen
    const savedProgramas = localStorage.getItem('adminProgramas');
    if (savedProgramas) {
      try {
        this.cachedProgramas = JSON.parse(savedProgramas);
      } catch (e) {
        this.cachedProgramas = [];
      }
    }
  }

  getRole(): AdminRole | null {
    return this.cachedRole;
  }

  getUserId(): string | null {
    return this.cachedUserId;
  }

  getProgramasAsignados(): string[] {
    return [...this.cachedProgramas];
  }

  isAdminGeneral(): boolean {
    return this.cachedRole === 'ADMIN_GENERAL';
  }

  isAdminPrograma(): boolean {
    return this.cachedRole === 'ADMIN_PROGRAMA';
  }

  hasAccess(requiredRole: AdminRole | 'BOTH'): boolean {
    if (!this.cachedRole) return false;
    if (requiredRole === 'BOTH') return true;
    if (requiredRole === 'ADMIN_GENERAL') return this.isAdminGeneral();
    if (requiredRole === 'ADMIN_PROGRAMA') return this.isAdminPrograma() || this.isAdminGeneral();
    return false;
  }

  setUserData(userId: string, role: AdminRole, programas?: string[]) {
    this.cachedUserId = userId;
    this.cachedRole = role;
    if (programas) {
      this.cachedProgramas = programas;
      localStorage.setItem('adminProgramas', JSON.stringify(programas));
    }
  }

  clear() {
    this.cachedRole = null;
    this.cachedUserId = null;
    this.cachedProgramas = [];
    localStorage.removeItem('adminProgramas');
  }

  refresh() {
    this.loadFromToken();
  }
}






