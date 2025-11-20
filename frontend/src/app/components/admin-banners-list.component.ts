import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AdminBannersService, Banner, BannerListResponse } from '../services/admin-banners.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin-banners-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xl);
      flex-wrap: wrap;
      gap: var(--spacing-md);
    }

    .banners-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
    }

    .banner-card {
      background: var(--bg-primary);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
      transition: all var(--transition-base);
      display: flex;
      flex-direction: column;
    }

    .banner-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .banner-image {
      width: 100%;
      height: 180px;
      object-fit: cover;
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-md);
      background: var(--gray-100);
    }

    .banner-header {
      margin-bottom: var(--spacing-md);
    }

    .banner-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs) 0;
    }

    .banner-subtitle {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      margin: 0;
    }

    .banner-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
      padding: var(--spacing-sm);
      background: var(--gray-50);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      text-transform: uppercase;
    }

    .status-badge.active {
      background: var(--success-light);
      color: white;
    }

    .status-badge.inactive {
      background: var(--gray-400);
      color: white;
    }

    .banner-actions {
      display: flex;
      gap: var(--spacing-sm);
      margin-top: auto;
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--border-color);
    }

    .filter-card {
      background: var(--bg-primary);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
      box-shadow: var(--shadow-sm);
    }

    .filter-controls {
      display: flex;
      gap: var(--spacing-md);
      flex-wrap: wrap;
      align-items: flex-end;
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-2xl);
      color: var(--text-secondary);
    }

    @media (max-width: 768px) {
      .banners-grid {
        grid-template-columns: 1fr;
      }

      .filter-controls {
        flex-direction: column;
      }
    }
  `],
  template: `
    <div>
      <div class="page-header">
        <div>
          <h1 style="margin: 0 0 var(--spacing-xs) 0; color: var(--primary);">Banners</h1>
          <p class="text-muted" style="margin: 0;">Gestiona los banners del sitio web</p>
        </div>
        <button class="btn" routerLink="/admin/banners/new">
          ➕ Crear Banner
        </button>
      </div>

      <div class="card filter-card">
        <form [formGroup]="filtersForm" (ngSubmit)="load()">
          <div class="filter-controls">
            <div class="form-group">
              <label for="activos">Estado</label>
              <select id="activos" formControlName="activos">
                <option [value]="undefined">Todos</option>
                <option [value]="true">Activos</option>
                <option [value]="false">Inactivos</option>
              </select>
            </div>
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
        <p>No se encontraron banners con los filtros seleccionados.</p>
        <button class="btn" routerLink="/admin/banners/new" style="margin-top: var(--spacing-md);">
          Crear primer banner
        </button>
      </div>

      <div class="banners-grid" *ngIf="!loading && items.length > 0">
        <div *ngFor="let banner of items" class="banner-card">
          <img 
            *ngIf="banner.imagenUrl" 
            [src]="banner.imagenUrl" 
            [alt]="banner.titulo"
            class="banner-image"
            (error)="$event.target.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5ZTllOWUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gaW1hZ2VuPC90ZXh0Pjwvc3ZnPg=='" />
          
          <div class="banner-header">
            <h3 class="banner-title">{{banner.titulo}}</h3>
            <p class="banner-subtitle" *ngIf="banner.subtitulo">{{banner.subtitulo}}</p>
          </div>

          <div class="banner-info">
            <span>Orden: {{banner.orden}}</span>
            <span class="status-badge" [class.active]="banner.activo" [class.inactive]="!banner.activo">
              <span>{{banner.activo ? '✓' : '○'}}</span>
              <span>{{banner.activo ? 'Activo' : 'Inactivo'}}</span>
            </span>
          </div>

          <div *ngIf="banner.enlaceAccion" style="margin-bottom: var(--spacing-md);">
            <a [href]="banner.enlaceAccion" target="_blank" rel="noopener noreferrer" class="text-muted" style="font-size: var(--font-size-sm);">
              🔗 {{banner.enlaceAccion}}
            </a>
          </div>

          <div class="banner-actions">
            <button class="btn btn-sm" (click)="toggleStatus(banner)" [disabled]="loading">
              <span *ngIf="banner.activo">⏸️ Desactivar</span>
              <span *ngIf="!banner.activo">▶️ Activar</span>
            </button>
            <button class="btn btn-sm btn-outline" routerLink="/admin/banners/{{banner.id}}">
              ✏️ Editar
            </button>
            <button class="btn btn-sm btn-outline" (click)="delete(banner)" [disabled]="loading" style="color: var(--error);">
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminBannersListComponent implements OnInit {
  items: Banner[] = [];
  loading = false;
  filtersForm = this.fb.group({
    activos: [undefined as boolean | undefined]
  });

  constructor(
    private fb: FormBuilder,
    private service: AdminBannersService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    const activos = this.filtersForm.value.activos ?? undefined;
    this.service.list(activos).subscribe({
      next: (res: BannerListResponse) => {
        this.items = res.items;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error al cargar banners');
      }
    });
  }

  clearFilters() {
    this.filtersForm.reset({ activos: undefined });
    this.load();
  }

  toggleStatus(banner: Banner) {
    if (!confirm(`¿${banner.activo ? 'Desactivar' : 'Activar'} este banner?`)) return;

    this.loading = true;
    this.service.update(banner.id, { activo: !banner.activo }).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success(`Banner ${banner.activo ? 'desactivado' : 'activado'}`);
        this.load();
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error al cambiar estado del banner');
      }
    });
  }

  delete(banner: Banner) {
    if (!confirm(`¿Eliminar definitivamente el banner "${banner.titulo}"?`)) return;

    this.loading = true;
    this.service.delete(banner.id).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Banner eliminado');
        this.load();
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error al eliminar banner');
      }
    });
  }
}

