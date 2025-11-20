import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminUsersService, AdminUser, AdminUserListResponse } from '../services/admin-users.service';
import { ToastService } from '../services/toast.service';
import { AdminRoleService } from '../services/admin-role.service';

@Component({
  selector: 'app-admin-users-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xl);
      flex-wrap: wrap;
      gap: var(--spacing-md);
    }

    .users-table {
      background: var(--bg-primary);
      border-radius: var(--border-radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .table-wrapper {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: var(--gray-50);
    }

    th {
      padding: var(--spacing-md);
      text-align: left;
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      border-bottom: 2px solid var(--border-color);
      font-size: var(--font-size-sm);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    td {
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--border-color);
      color: var(--text-primary);
    }

    tr:hover {
      background: var(--gray-50);
    }

    .role-badge {
      display: inline-block;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      text-transform: uppercase;
    }

    .role-badge.ADMIN_GENERAL {
      background: var(--primary);
      color: white;
    }

    .role-badge.ADMIN_PROGRAMA {
      background: var(--secondary);
      color: white;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
    }

    .status-badge.active {
      background: var(--success-light);
      color: white;
    }

    .status-badge.inactive {
      background: var(--gray-400);
      color: white;
    }

    .action-buttons {
      display: flex;
      gap: var(--spacing-xs);
    }

    .btn-icon {
      padding: var(--spacing-xs);
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-secondary);
      font-size: var(--font-size-lg);
      transition: color var(--transition-base);
    }

    .btn-icon:hover {
      color: var(--primary);
    }

    .programas-list {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-2xl);
      color: var(--text-secondary);
    }

    @media (max-width: 768px) {
      .table-wrapper {
        font-size: var(--font-size-sm);
      }

      th, td {
        padding: var(--spacing-sm);
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `],
  template: `
    <div>
      <div class="page-header">
        <div>
          <h1 style="margin: 0 0 var(--spacing-xs) 0; color: var(--primary);">Usuarios Administrativos</h1>
          <p class="text-muted" style="margin: 0;">Gestiona los usuarios con acceso administrativo</p>
        </div>
        <button class="btn" routerLink="/admin/users/new" *ngIf="roleService.isAdminGeneral()">
          ➕ Crear Usuario
        </button>
      </div>

      <div *ngIf="loading" class="loading-spinner" style="display: flex; justify-content: center; padding: var(--spacing-2xl);">
        <div class="loading"></div>
      </div>

      <div *ngIf="!loading && items.length === 0" class="empty-state">
        <p>No hay usuarios administrativos registrados.</p>
        <button *ngIf="roleService.isAdminGeneral()" class="btn" routerLink="/admin/users/new" style="margin-top: var(--spacing-md);">
          Crear primer usuario
        </button>
      </div>

      <div class="users-table" *ngIf="!loading && items.length > 0">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Programas</th>
                <th>Estado</th>
                <th>Último Acceso</th>
                <th *ngIf="roleService.isAdminGeneral()">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of items">
                <td>{{user.username}}</td>
                <td>{{user.nombre || '-'}}</td>
                <td>{{user.correo || '-'}}</td>
                <td>
                  <span class="role-badge" [class]="user.role">
                    {{user.role === 'ADMIN_GENERAL' ? 'Administrador General' : 'Admin Programa'}}
                  </span>
                </td>
                <td>
                  <div class="programas-list" *ngIf="user.programasAsignados && user.programasAsignados.length > 0">
                    {{user.programasAsignados.join(', ')}}
                  </div>
                  <span class="text-muted" *ngIf="!user.programasAsignados || user.programasAsignados.length === 0">
                    -
                  </span>
                </td>
                <td>
                  <span class="status-badge" [class.active]="user.activo" [class.inactive]="!user.activo">
                    <span>{{user.activo ? '✓' : '○'}}</span>
                    <span>{{user.activo ? 'Activo' : 'Inactivo'}}</span>
                  </span>
                </td>
                <td>
                  <span class="text-muted" style="font-size: var(--font-size-sm);">
                    {{user.ultimoAcceso ? (user.ultimoAcceso | date:'short') : 'Nunca'}}
                  </span>
                </td>
                <td *ngIf="roleService.isAdminGeneral()">
                  <div class="action-buttons">
                    <button 
                      class="btn-icon" 
                      (click)="edit(user.id)"
                      title="Editar"
                      aria-label="Editar">
                      ✏️
                    </button>
                    <button 
                      class="btn-icon" 
                      (click)="toggleStatus(user)"
                      [disabled]="loading"
                      [title]="user.activo ? 'Desactivar' : 'Activar'"
                      [attr.aria-label]="user.activo ? 'Desactivar' : 'Activar'">
                      {{user.activo ? '⏸️' : '▶️'}}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminUsersListComponent implements OnInit {
  items: AdminUser[] = [];
  loading = false;

  constructor(
    private service: AdminUsersService,
    private toast: ToastService,
    private router: Router,
    public roleService: AdminRoleService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.service.list().subscribe({
      next: (res: AdminUserListResponse) => {
        this.items = res.items;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error al cargar usuarios');
      }
    });
  }

  edit(id: string) {
    this.router.navigate(['/admin/users', id]);
  }

  toggleStatus(user: AdminUser) {
    if (!confirm(`¿${user.activo ? 'Desactivar' : 'Activar'} el usuario "${user.username}"?`)) return;

    this.loading = true;
    this.service.update(user.id, { activo: !user.activo }).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success(`Usuario ${user.activo ? 'desactivado' : 'activado'}`);
        this.load();
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error al cambiar estado del usuario');
      }
    });
  }
}

