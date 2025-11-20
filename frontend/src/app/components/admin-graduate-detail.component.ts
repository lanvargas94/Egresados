import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminGraduatesService, Graduate } from '../services/admin-graduates.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin-graduate-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styles: [`
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xl);
      flex-wrap: wrap;
      gap: var(--spacing-md);
    }

    .section-card {
      background: var(--bg-primary);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-xl);
      margin-bottom: var(--spacing-lg);
      box-shadow: var(--shadow-sm);
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-lg);
      padding-bottom: var(--spacing-md);
      border-bottom: 2px solid var(--border-color);
      color: var(--primary);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-md);
    }

    .readonly-field {
      background: var(--gray-50);
      color: var(--text-secondary);
      cursor: not-allowed;
    }

    .status-display {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--border-radius-md);
      font-weight: var(--font-weight-medium);
    }

    .status-display.ACTIVO {
      background: var(--success-light);
      color: white;
    }

    .status-display.INACTIVO {
      background: var(--gray-400);
      color: white;
    }

    .status-display.BLOQUEADO {
      background: var(--error);
      color: white;
    }

    .form-actions {
      display: flex;
      gap: var(--spacing-md);
      margin-top: var(--spacing-xl);
      padding-top: var(--spacing-lg);
      border-top: 2px solid var(--border-color);
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `],
  template: `
    <div>
      <div class="detail-header">
        <div>
          <h1 style="margin: 0 0 var(--spacing-xs) 0; color: var(--primary);">
            {{graduate?.nombreLegal || 'Egresado'}}
          </h1>
          <p class="text-muted" style="margin: 0;">{{graduate?.identificacion}}</p>
        </div>
        <a routerLink="/admin/graduates" class="btn btn-outline">← Volver al listado</a>
      </div>

      <div *ngIf="loading" class="loading-spinner" style="display: flex; justify-content: center; padding: var(--spacing-2xl);">
        <div class="loading"></div>
      </div>

      <form *ngIf="!loading && graduate" [formGroup]="form" (ngSubmit)="save()">
        <!-- Datos Personales -->
        <div class="section-card">
          <div class="section-title">
            <span>👤</span>
            <span>Datos Personales</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="identificacion">Número de Identificación</label>
              <input 
                id="identificacion"
                type="text"
                [value]="graduate.identificacion"
                class="readonly-field"
                readonly />
              <small class="text-muted">Campo no editable</small>
            </div>

            <div class="form-group">
              <label for="nombreLegal">Nombre Legal</label>
              <input 
                id="nombreLegal"
                type="text"
                [value]="graduate.nombreLegal"
                class="readonly-field"
                readonly />
              <small class="text-muted">Campo no editable</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Estado</label>
              <div class="status-display" [class]="(graduate.estado || 'ACTIVO')">
                {{graduate.estado || 'ACTIVO'}}
              </div>
            </div>
          </div>
        </div>

        <!-- Información Académica -->
        <div class="section-card" *ngIf="graduate.programas && graduate.programas.length > 0">
          <div class="section-title">
            <span>🎓</span>
            <span>Información Académica</span>
          </div>

          <div class="form-row">
            <div class="form-group" *ngFor="let prog of graduate.programas">
              <label>Programa</label>
              <input 
                type="text"
                [value]="prog.programa + ' - ' + prog.facultad + ' (' + prog.anio + ')'"
                class="readonly-field"
                readonly />
            </div>
          </div>
        </div>

        <!-- Datos de Contacto -->
        <div class="section-card">
          <div class="section-title">
            <span>📧</span>
            <span>Datos de Contacto</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="correoPersonal">Correo Personal</label>
              <input 
                id="correoPersonal"
                type="email"
                formControlName="correoPersonal"
                placeholder="correo@ejemplo.com" />
            </div>

            <div class="form-group">
              <label for="telefonoMovil">Teléfono Móvil</label>
              <input 
                id="telefonoMovil"
                type="tel"
                formControlName="telefonoMovil"
                placeholder="+57 300 123 4567" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="pais">País</label>
              <input 
                id="pais"
                type="text"
                formControlName="pais"
                placeholder="Ej: Colombia" />
            </div>

            <div class="form-group">
              <label for="ciudad">Ciudad</label>
              <input 
                id="ciudad"
                type="text"
                formControlName="ciudad"
                placeholder="Ej: Neiva" />
            </div>
          </div>
        </div>

        <!-- Información Laboral -->
        <div class="section-card" *ngIf="graduate.situacionLaboral || graduate.empresa">
          <div class="section-title">
            <span>💼</span>
            <span>Información Laboral</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Situación Laboral</label>
              <input 
                type="text"
                [value]="graduate.situacionLaboral || '-'"
                class="readonly-field"
                readonly />
              <small class="text-muted">Campo no editable</small>
            </div>

            <div class="form-group">
              <label>Industria</label>
              <input 
                type="text"
                [value]="graduate.industria || '-'"
                class="readonly-field"
                readonly />
              <small class="text-muted">Campo no editable</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Empresa</label>
              <input 
                type="text"
                [value]="graduate.empresa || '-'"
                class="readonly-field"
                readonly />
              <small class="text-muted">Campo no editable</small>
            </div>

            <div class="form-group">
              <label>Cargo</label>
              <input 
                type="text"
                [value]="graduate.cargo || '-'"
                class="readonly-field"
                readonly />
              <small class="text-muted">Campo no editable</small>
            </div>
          </div>
        </div>

        <!-- Observaciones Internas -->
        <div class="section-card">
          <div class="section-title">
            <span>📝</span>
            <span>Observaciones Internas</span>
          </div>

          <div class="form-group">
            <label for="observacionesInternas">Notas para administradores</label>
            <textarea 
              id="observacionesInternas"
              formControlName="observacionesInternas"
              rows="4"
              placeholder="Ingresa observaciones internas sobre este egresado..."></textarea>
          </div>
        </div>

        <!-- Estado -->
        <div class="section-card">
          <div class="section-title">
            <span>⚙️</span>
            <span>Estado del Egresado</span>
          </div>

          <div class="form-group">
            <label for="estado">Estado</label>
            <select id="estado" formControlName="estado">
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="BLOQUEADO">Bloqueado</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button 
            class="btn" 
            type="submit" 
            [disabled]="form.invalid || saving"
            [attr.aria-busy]="saving">
            <span *ngIf="!saving">💾 Guardar Cambios</span>
            <span *ngIf="saving">Guardando...</span>
          </button>
          <a routerLink="/admin/graduates" class="btn btn-outline">
            Cancelar
          </a>
        </div>
      </form>
    </div>
  `
})
export class AdminGraduateDetailComponent implements OnInit {
  graduate: Graduate | null = null;
  form: FormGroup;
  loading = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private service: AdminGraduatesService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      correoPersonal: ['', [Validators.email]],
      telefonoMovil: [''],
      pais: [''],
      ciudad: [''],
      observacionesInternas: [''],
      estado: ['ACTIVO']
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/admin/graduates']);
      return;
    }
    this.load(id);
  }

  load(id: string) {
    this.loading = true;
    this.service.get(id).subscribe({
      next: (g: Graduate) => {
        this.graduate = g;
        this.form.patchValue({
          correoPersonal: g.correoPersonal || '',
          telefonoMovil: g.telefonoMovilE164 || '',
          pais: g.pais || '',
          ciudad: g.ciudad || '',
          observacionesInternas: g.observacionesInternas || '',
          estado: g.estado || 'ACTIVO'
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error al cargar egresado');
        this.router.navigate(['/admin/graduates']);
      }
    });
  }

  save() {
    if (this.form.invalid || !this.graduate) return;

    this.saving = true;
    const values = this.form.value;
    this.service.update(this.graduate.id, {
      correoPersonal: values.correoPersonal || null,
      telefonoMovil: values.telefonoMovil || null,
      pais: values.pais || null,
      ciudad: values.ciudad || null,
      observacionesInternas: values.observacionesInternas || null,
      estado: values.estado
    }).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Cambios guardados exitosamente');
        this.load(this.graduate!.id);
      },
      error: (err) => {
        this.saving = false;
        const message = err?.error?.error || 'Error al guardar cambios';
        this.toast.error(message);
      }
    });
  }
}



