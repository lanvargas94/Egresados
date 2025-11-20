import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AdminAuditService, AuditLog, AuditLogListResponse } from '../services/admin-audit.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin-audit-log',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  styles: [`
    .page-header {
      margin-bottom: var(--spacing-xl);
    }

    .filters-card {
      background: var(--bg-primary);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
      box-shadow: var(--shadow-sm);
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-md);
    }

    .audit-table {
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
      font-size: var(--font-size-sm);
    }

    tr:hover {
      background: var(--gray-50);
    }

    .action-badge {
      display: inline-block;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      background: var(--gray-100);
      color: var(--text-primary);
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      background: var(--gray-50);
      flex-wrap: wrap;
      gap: var(--spacing-md);
    }

    .pagination-info {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }

    .pagination-controls {
      display: flex;
      gap: var(--spacing-sm);
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-2xl);
      color: var(--text-secondary);
    }

    @media (max-width: 768px) {
      .filters-grid {
        grid-template-columns: 1fr;
      }

      .table-wrapper {
        font-size: var(--font-size-xs);
      }

      th, td {
        padding: var(--spacing-sm);
      }
    }
  `],
  template: `
    <div>
      <div class="page-header">
        <h1 style="margin: 0 0 var(--spacing-xs) 0; color: var(--primary);">Registro de Auditoría</h1>
        <p class="text-muted" style="margin: 0;">Historial de acciones realizadas en el sistema</p>
      </div>

      <div class="card filters-card">
        <form [formGroup]="filtersForm" (ngSubmit)="applyFilters()">
          <h3 style="margin-top: 0;">Filtros</h3>
          <div class="filters-grid">
            <div class="form-group">
              <label for="from">Desde</label>
              <input 
                id="from"
                type="datetime-local"
                formControlName="from" />
            </div>

            <div class="form-group">
              <label for="to">Hasta</label>
              <input 
                id="to"
                type="datetime-local"
                formControlName="to" />
            </div>

            <div class="form-group">
              <label for="actor">Actor (Usuario)</label>
              <input 
                id="actor"
                type="text"
                formControlName="actor"
                placeholder="Buscar por usuario" />
            </div>

            <div class="form-group">
              <label for="entity">Entidad</label>
              <input 
                id="entity"
                type="text"
                formControlName="entity"
                placeholder="Ej: Graduate, News" />
            </div>

            <div class="form-group">
              <label for="action">Acción</label>
              <input 
                id="action"
                type="text"
                formControlName="action"
                placeholder="Ej: CREATE, UPDATE" />
            </div>
          </div>

          <div style="display: flex; gap: var(--spacing-md);">
            <button class="btn" type="submit" [disabled]="loading">
              🔍 Filtrar
            </button>
            <button type="button" class="btn btn-outline" (click)="clearFilters()">
              Limpiar
            </button>
          </div>
        </form>
      </div>

      <div *ngIf="loading" class="loading-spinner" style="display: flex; justify-content: center; padding: var(--spacing-2xl);">
        <div class="loading"></div>
      </div>

      <div *ngIf="!loading && items.length === 0" class="empty-state">
        <p>No se encontraron registros de auditoría con los filtros seleccionados.</p>
      </div>

      <div class="audit-table" *ngIf="!loading && items.length > 0">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Actor</th>
                <th>Acción</th>
                <th>Entidad</th>
                <th>ID Entidad</th>
                <th>Resumen</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of items">
                <td>
                  <span class="text-muted" style="font-size: var(--font-size-xs);">
                    {{log.createdAt | date:'short'}}
                  </span>
                </td>
                <td>{{log.actor}}</td>
                <td>
                  <span class="action-badge">{{log.action}}</span>
                </td>
                <td>{{log.entity}}</td>
                <td>
                  <span class="text-muted" style="font-size: var(--font-size-xs); font-family: monospace;">
                    {{log.entityId}}
                  </span>
                </td>
                <td>{{log.summary}}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <div class="pagination-info">
            Mostrando {{items.length}} de {{total}} registros
            (Página {{page + 1}} de {{totalPages}})
          </div>
          <div class="pagination-controls">
            <button 
              class="btn btn-sm" 
              (click)="previousPage()" 
              [disabled]="page === 0 || loading">
              ← Anterior
            </button>
            <button 
              class="btn btn-sm" 
              (click)="nextPage()" 
              [disabled]="page >= totalPages - 1 || loading">
              Siguiente →
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminAuditLogComponent implements OnInit {
  items: AuditLog[] = [];
  total = 0;
  page = 0;
  size = 50;
  loading = false;
  filtersForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: AdminAuditService,
    private toast: ToastService
  ) {
    this.filtersForm = this.fb.group({
      from: [''],
      to: [''],
      actor: [''],
      entity: [''],
      action: ['']
    });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    const filters: any = {};
    
    const from = this.filtersForm.value.from;
    if (from) {
      filters.from = new Date(from).toISOString();
    }
    
    const to = this.filtersForm.value.to;
    if (to) {
      filters.to = new Date(to).toISOString();
    }
    
    if (this.filtersForm.value.actor) {
      filters.actor = this.filtersForm.value.actor;
    }
    
    if (this.filtersForm.value.entity) {
      filters.entity = this.filtersForm.value.entity;
    }
    
    if (this.filtersForm.value.action) {
      filters.action = this.filtersForm.value.action;
    }

    this.service.list(this.page, this.size, filters).subscribe({
      next: (res: AuditLogListResponse) => {
        this.items = res.items;
        this.total = res.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error al cargar registro de auditoría');
      }
    });
  }

  applyFilters() {
    this.page = 0;
    this.load();
  }

  clearFilters() {
    this.filtersForm.reset();
    this.page = 0;
    this.load();
  }

  previousPage() {
    if (this.page > 0) {
      this.page--;
      this.load();
    }
  }

  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.load();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.size);
  }
}

