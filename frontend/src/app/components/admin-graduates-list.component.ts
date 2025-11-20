import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AdminGraduatesService, GraduateFilters, GraduateListResponse, Graduate } from '../services/admin-graduates.service';
import { CatalogService } from '../services/catalog.service';
import { ToastService } from '../services/toast.service';
import { AdminRoleService } from '../services/admin-role.service';

@Component({
  selector: 'app-admin-graduates-list',
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

    .table-container {
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

    .status-badge {
      display: inline-block;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      text-transform: uppercase;
    }

    .status-badge.ACTIVO {
      background: var(--success-light);
      color: white;
    }

    .status-badge.INACTIVO {
      background: var(--gray-400);
      color: white;
    }

    .status-badge.BLOQUEADO {
      background: var(--error);
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
      
      &:hover {
        color: var(--primary);
      }
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

    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: var(--spacing-2xl);
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
          <h1 style="margin: 0 0 var(--spacing-xs) 0; color: var(--primary);">Egresados</h1>
          <p class="text-muted" style="margin: 0;">Gestiona la información de los egresados</p>
        </div>
        <button class="btn" (click)="exportToCSV()" [disabled]="items.length === 0">
          📥 Exportar CSV
        </button>
      </div>

      <div class="card filters-card">
        <h3 style="margin-top: 0;">Filtros</h3>
        <form [formGroup]="filtersForm" (ngSubmit)="applyFilters()">
          <div class="filters-grid">
            <div class="form-group">
              <label for="nombre">Nombre</label>
              <input 
                id="nombre"
                type="text"
                formControlName="nombre"
                placeholder="Buscar por nombre" />
            </div>

            <div class="form-group">
              <label for="identificacion">Documento</label>
              <input 
                id="identificacion"
                type="text"
                formControlName="identificacion"
                placeholder="Buscar por documento" />
            </div>

            <div class="form-group">
              <label for="programa">Programa</label>
              <select id="programa" formControlName="programa" (change)="onProgramChange()">
                <option value="">Todos los programas</option>
                <option *ngFor="let p of availablePrograms" [value]="p">{{p}}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="anioGraduacion">Año Graduación</label>
              <input 
                id="anioGraduacion"
                type="number"
                formControlName="anioGraduacion"
                placeholder="Ej: 2020"
                min="1990"
                max="2030" />
            </div>

            <div class="form-group">
              <label for="estado">Estado</label>
              <select id="estado" formControlName="estado">
                <option value="">Todos</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="BLOQUEADO">Bloqueado</option>
              </select>
            </div>

            <div class="form-group">
              <label for="ciudad">Ciudad</label>
              <select id="ciudad" formControlName="ciudad">
                <option value="">Todas las ciudades</option>
                <option *ngFor="let c of availableCities" [value]="c">{{c}}</option>
              </select>
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

      <div class="table-container" *ngIf="!loading && items.length > 0">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Programa</th>
                <th>Año</th>
                <th>Ciudad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of items">
                <td>{{item.nombreLegal || 'Sin nombre'}}</td>
                <td>{{item.identificacion}}</td>
                <td>
                  <span *ngIf="item.programas && item.programas.length > 0">
                    {{item.programas[0].programa}}
                  </span>
                  <span *ngIf="!item.programas || item.programas.length === 0" class="text-muted">
                    Sin programa
                  </span>
                </td>
                <td>
                  <span *ngIf="item.programas && item.programas.length > 0">
                    {{item.programas[0].anio}}
                  </span>
                </td>
                <td>{{item.ciudad || '-'}}</td>
                <td>
                  <span class="status-badge" [class]="(item.estado || 'ACTIVO')">
                    {{item.estado || 'ACTIVO'}}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="btn-icon" 
                      (click)="viewDetail(item.id)"
                      title="Ver detalle"
                      aria-label="Ver detalle">
                      👁️
                    </button>
                    <button 
                      class="btn-icon" 
                      (click)="edit(item.id)"
                      title="Editar"
                      aria-label="Editar">
                      ✏️
                    </button>
                    <button 
                      class="btn-icon" 
                      (click)="changeStatus(item)"
                      title="Cambiar estado"
                      aria-label="Cambiar estado">
                      ⚙️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <div class="pagination-info">
            Mostrando {{items.length}} de {{total}} egresados
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

      <div *ngIf="loading" class="loading-spinner">
        <div class="loading"></div>
      </div>

      <div *ngIf="!loading && items.length === 0" class="empty-state">
        <p>No se encontraron egresados con los filtros seleccionados.</p>
      </div>
    </div>
  `
})
export class AdminGraduatesListComponent implements OnInit {
  items: Graduate[] = [];
  total = 0;
  page = 0;
  size = 10;
  loading = false;
  filtersForm: FormGroup;
  availablePrograms: string[] = [];
  availableCities: string[] = [];

  constructor(
    private fb: FormBuilder,
    private service: AdminGraduatesService,
    private catalog: CatalogService,
    private toast: ToastService,
    private router: Router,
    private roleService: AdminRoleService
  ) {
    this.filtersForm = this.fb.group({
      nombre: [''],
      identificacion: [''],
      programa: [''],
      anioGraduacion: [''],
      estado: [''],
      ciudad: ['']
    });

    // Si es ADMIN_PROGRAMA, cargar solo sus programas asignados
    if (this.roleService.isAdminPrograma()) {
      this.availablePrograms = this.roleService.getProgramasAsignados();
    }
  }

  ngOnInit() {
    this.loadPrograms();
    this.loadCities();
    this.load();
  }

  loadPrograms() {
    if (this.roleService.isAdminPrograma()) {
      // Si es ADMIN_PROGRAMA, usar sus programas asignados
      this.availablePrograms = this.roleService.getProgramasAsignados();
    } else {
      // Si es ADMIN_GENERAL, cargar todos los programas
      this.catalog.faculties().subscribe({
        next: (faculties: any) => {
          const programPromises = faculties.map((fac: any) => 
            this.catalog.programs(fac.name).toPromise()
          );
          Promise.all(programPromises).then((results: (string[] | undefined)[]) => {
            const allPrograms: string[] = [];
            results.forEach((progs) => {
              if (progs) allPrograms.push(...progs);
            });
            this.availablePrograms = [...new Set(allPrograms)]; // Eliminar duplicados
          });
        }
      });
    }
  }

  loadCities() {
    this.catalog.countries().subscribe({
      next: (countries: any) => {
        const colombia = countries.find((c: any) => c.code === 'CO');
        if (colombia) {
          this.catalog.cities(colombia.code).subscribe({
            next: (cities: any) => {
              this.availableCities = cities as string[];
            }
          });
        }
      }
    });
  }

  load() {
    this.loading = true;
    const filters: GraduateFilters = {
      nombre: this.filtersForm.value.nombre || undefined,
      identificacion: this.filtersForm.value.identificacion || undefined,
      programa: this.filtersForm.value.programa || undefined,
      anioGraduacion: this.filtersForm.value.anioGraduacion ? 
        parseInt(this.filtersForm.value.anioGraduacion) : undefined,
      estado: this.filtersForm.value.estado || undefined,
      ciudad: this.filtersForm.value.ciudad || undefined
    };

    // Si es ADMIN_PROGRAMA, limitar filtros a sus programas
    if (this.roleService.isAdminPrograma()) {
      const programas = this.roleService.getProgramasAsignados();
      if (programas.length > 0) {
        // Si no hay filtro de programa, usar el primero por defecto
        // Si hay filtro, verificar que esté en los programas asignados
        if (!filters.programa) {
          filters.programa = programas[0];
        } else if (!programas.includes(filters.programa)) {
          // Si el programa filtrado no está en los asignados, usar el primero
          filters.programa = programas[0];
        }
      }
    }

    this.service.list(filters, this.page, this.size).subscribe({
      next: (res: GraduateListResponse) => {
        this.items = res.items;
        this.total = res.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error al cargar egresados');
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

  onProgramChange() {
    // Se puede implementar lógica adicional si es necesario
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

  viewDetail(id: string) {
    this.router.navigate(['/admin/graduates', id]);
  }

  edit(id: string) {
    this.router.navigate(['/admin/graduates', id, 'edit']);
  }

  changeStatus(item: Graduate) {
    const currentStatus = item.estado || 'ACTIVO';
    const statuses: Array<'ACTIVO' | 'INACTIVO' | 'BLOQUEADO'> = ['ACTIVO', 'INACTIVO', 'BLOQUEADO'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextIndex];

    if (confirm(`¿Cambiar estado de ${item.nombreLegal} a ${newStatus}?`)) {
      this.loading = true;
      this.service.changeStatus(item.id, newStatus).subscribe({
        next: () => {
          this.loading = false;
          this.toast.success(`Estado cambiado a ${newStatus}`);
          this.load();
        },
        error: () => {
          this.loading = false;
          this.toast.error('Error al cambiar estado');
        }
      });
    }
  }

  exportToCSV() {
    const headers = ['Nombre', 'Documento', 'Programa', 'Año', 'Ciudad', 'Estado', 'Correo'];
    const rows = this.items.map(item => [
      item.nombreLegal || '',
      item.identificacion,
      item.programas && item.programas.length > 0 ? item.programas[0].programa : '',
      item.programas && item.programas.length > 0 ? String(item.programas[0].anio) : '',
      item.ciudad || '',
      item.estado || 'ACTIVO',
      item.correoPersonal || ''
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `egresados-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    this.toast.success('Exportación completada');
  }
}

