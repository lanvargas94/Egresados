import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AdminUsersService, AdminUser } from '../services/admin-users.service';
import { ToastService } from '../services/toast.service';
import { CatalogService } from '../services/catalog.service';

@Component({
  selector: 'app-admin-users-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styles: [`
    .form-header {
      margin-bottom: var(--spacing-xl);
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-md);
    }

    .form-actions {
      display: flex;
      gap: var(--spacing-md);
      margin-top: var(--spacing-xl);
      padding-top: var(--spacing-lg);
      border-top: 2px solid var(--border-color);
    }

    .programas-section {
      background: var(--gray-50);
      padding: var(--spacing-md);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-md);
    }

    .programas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--spacing-sm);
      margin-top: var(--spacing-sm);
    }

    .programa-checkbox {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs);
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .programas-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  template: `
    <div>
      <div class="form-header">
        <h1 style="margin: 0 0 var(--spacing-xs) 0; color: var(--primary);">
          {{isEdit ? 'Editar Usuario' : 'Crear Usuario'}}
        </h1>
        <p class="text-muted" style="margin: 0;">
          {{isEdit ? 'Modifica la información del usuario administrativo' : 'Crea un nuevo usuario con acceso administrativo'}}
        </p>
      </div>

      <div class="card" *ngIf="!loading || form">
        <form [formGroup]="form" (ngSubmit)="save()">
          <div class="form-row">
            <div class="form-group">
              <label for="username">Usuario *</label>
              <input 
                id="username"
                type="text"
                formControlName="username"
                placeholder="nombre.usuario"
                [attr.disabled]="isEdit || null"
                [attr.aria-invalid]="form.controls.username.invalid && form.controls.username.touched" />
              <div 
                class="error" 
                *ngIf="form.controls.username.invalid && form.controls.username.touched"
                role="alert">
                El usuario es requerido
              </div>
              <small class="text-muted" *ngIf="isEdit">El usuario no se puede modificar</small>
            </div>

            <div class="form-group" *ngIf="!isEdit">
              <label for="password">Contraseña *</label>
              <input 
                id="password"
                type="password"
                formControlName="password"
                placeholder="••••••••"
                [attr.aria-invalid]="form.controls.password?.invalid && form.controls.password?.touched" />
              <div 
                class="error" 
                *ngIf="form.controls.password?.invalid && form.controls.password?.touched"
                role="alert">
                La contraseña es requerida (mínimo 6 caracteres)
              </div>
            </div>

            <div class="form-group" *ngIf="isEdit">
              <label for="newPassword">Nueva Contraseña (opcional)</label>
              <input 
                id="newPassword"
                type="password"
                formControlName="newPassword"
                placeholder="Dejar vacío para no cambiar" />
              <small class="text-muted">Solo llena este campo si deseas cambiar la contraseña</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="nombre">Nombre Completo</label>
              <input 
                id="nombre"
                type="text"
                formControlName="nombre"
                placeholder="Juan Pérez" />
            </div>

            <div class="form-group">
              <label for="correo">Correo Electrónico</label>
              <input 
                id="correo"
                type="email"
                formControlName="correo"
                placeholder="usuario@corhuila.edu.co" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="role">Rol *</label>
              <select 
                id="role"
                formControlName="role"
                (change)="onRoleChange()"
                [attr.aria-invalid]="form.controls.role.invalid && form.controls.role.touched">
                <option value="">Seleccione un rol...</option>
                <option value="ADMIN_GENERAL">Administrador General</option>
                <option value="ADMIN_PROGRAMA">Administrador de Programa</option>
              </select>
              <div 
                class="error" 
                *ngIf="form.controls.role.invalid && form.controls.role.touched"
                role="alert">
                El rol es requerido
              </div>
            </div>

            <div class="form-group">
              <label>
                <input 
                  type="checkbox" 
                  formControlName="activo" />
                <span style="margin-left: var(--spacing-sm);">Usuario activo</span>
              </label>
              <small class="text-muted" style="display: block; margin-top: var(--spacing-xs);">
                Solo los usuarios activos pueden iniciar sesión
              </small>
            </div>
          </div>

          <div class="programas-section" *ngIf="form.value.role === 'ADMIN_PROGRAMA'">
            <label style="font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-sm); display: block;">
              Programas Asignados
            </label>
            <small class="text-muted" style="display: block; margin-bottom: var(--spacing-sm);">
              Selecciona los programas que este administrador puede gestionar
            </small>
            <div class="programas-grid" *ngIf="availablePrograms.length > 0">
              <div class="programa-checkbox" *ngFor="let prog of availablePrograms">
                <input 
                  type="checkbox" 
                  [id]="'prog-' + prog"
                  [value]="prog"
                  [checked]="form.value.programasAsignados?.includes(prog)"
                  (change)="togglePrograma(prog, $event.target.checked)" />
                <label [for]="'prog-' + prog" style="cursor: pointer; margin: 0;">
                  {{prog}}
                </label>
              </div>
            </div>
            <div *ngIf="availablePrograms.length === 0" class="text-muted">
              Cargando programas...
            </div>
          </div>

          <div class="form-actions">
            <button 
              class="btn" 
              type="submit" 
              [disabled]="form.invalid || saving"
              [attr.aria-busy]="saving">
              <span *ngIf="!saving">💾 {{isEdit ? 'Actualizar' : 'Crear'}} Usuario</span>
              <span *ngIf="saving">Guardando...</span>
            </button>
            <a routerLink="/admin/users" class="btn btn-outline">
              Cancelar
            </a>
          </div>
        </form>
      </div>

      <div *ngIf="loading" class="loading-spinner" style="display: flex; justify-content: center; padding: var(--spacing-2xl);">
        <div class="loading"></div>
      </div>
    </div>
  `
})
export class AdminUsersFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  loading = false;
  saving = false;
  availablePrograms: string[] = [];

  constructor(
    private fb: FormBuilder,
    private service: AdminUsersService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private catalog: CatalogService
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.minLength(6)]],
      nombre: [''],
      correo: ['', [Validators.email]],
      role: ['', Validators.required],
      programasAsignados: [[] as string[]],
      activo: [true]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.form.removeControl('password');
      this.load(id);
    } else {
      this.loadPrograms();
    }
  }

  load(id: string) {
    this.loading = true;
    this.service.get(id).subscribe({
      next: (user: AdminUser) => {
        this.form.patchValue({
          username: user.username,
          nombre: user.nombre || '',
          correo: user.correo || '',
          role: user.role,
          programasAsignados: user.programasAsignados || [],
          activo: user.activo
        });
        this.loading = false;
        if (user.role === 'ADMIN_PROGRAMA') {
          this.loadPrograms();
        }
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error al cargar usuario');
        this.router.navigate(['/admin/users']);
      }
    });
  }

  loadPrograms() {
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
          this.availablePrograms = [...new Set(allPrograms)].sort();
        });
      }
    });
  }

  onRoleChange() {
    if (this.form.value.role === 'ADMIN_PROGRAMA' && this.availablePrograms.length === 0) {
      this.loadPrograms();
    }
  }

  togglePrograma(prog: string, checked: boolean) {
    const programas = this.form.value.programasAsignados || [];
    if (checked) {
      if (!programas.includes(prog)) {
        this.form.patchValue({ programasAsignados: [...programas, prog] });
      }
    } else {
      this.form.patchValue({ programasAsignados: programas.filter((p: string) => p !== prog) });
    }
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const values = this.form.value;

    const data: any = {
      nombre: values.nombre || undefined,
      correo: values.correo || undefined,
      role: values.role,
      programasAsignados: values.role === 'ADMIN_PROGRAMA' ? (values.programasAsignados || []) : undefined,
      activo: values.activo !== false
    };

    if (this.isEdit) {
      if (values.newPassword) {
        data.newPassword = values.newPassword;
      }
      this.service.update(this.route.snapshot.paramMap.get('id')!, data).subscribe({
        next: () => {
          this.saving = false;
          this.toast.success('Usuario actualizado exitosamente');
          this.router.navigate(['/admin/users']);
        },
        error: (err) => {
          this.saving = false;
          const message = err?.error?.error || 'Error al actualizar usuario';
          this.toast.error(message);
        }
      });
    } else {
      data.username = values.username;
      data.password = values.password;
      this.service.create(data).subscribe({
        next: () => {
          this.saving = false;
          this.toast.success('Usuario creado exitosamente');
          this.router.navigate(['/admin/users']);
        },
        error: (err) => {
          this.saving = false;
          const message = err?.error?.error || 'Error al crear usuario';
          this.toast.error(message);
        }
      });
    }
  }
}



