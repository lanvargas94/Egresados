import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminBannersService, Banner } from '../services/admin-banners.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin-banners-form',
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

    .image-preview {
      width: 100%;
      max-width: 500px;
      height: 250px;
      object-fit: cover;
      border-radius: var(--border-radius-md);
      margin-top: var(--spacing-sm);
      background: var(--gray-100);
      border: 1px solid var(--border-color);
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
      <div class="form-header">
        <h1 style="margin: 0 0 var(--spacing-xs) 0; color: var(--primary);">
          {{isEdit ? 'Editar Banner' : 'Crear Banner'}}
        </h1>
        <p class="text-muted" style="margin: 0;">
          {{isEdit ? 'Modifica la información del banner' : 'Crea un nuevo banner para el sitio web'}}
        </p>
      </div>

      <div class="card" *ngIf="!loading || form">
        <form [formGroup]="form" (ngSubmit)="save()">
          <div class="form-row">
            <div class="form-group">
              <label for="titulo">Título *</label>
              <input 
                id="titulo"
                type="text"
                formControlName="titulo"
                placeholder="Título del banner"
                [attr.aria-invalid]="form.controls.titulo.invalid && form.controls.titulo.touched" />
              <div 
                class="error" 
                *ngIf="form.controls.titulo.invalid && form.controls.titulo.touched"
                role="alert">
                El título es requerido
              </div>
            </div>

            <div class="form-group">
              <label for="orden">Orden</label>
              <input 
                id="orden"
                type="number"
                formControlName="orden"
                placeholder="1"
                min="1" />
              <small class="text-muted">Número para ordenar los banners (menor = primero)</small>
            </div>
          </div>

          <div class="form-group">
            <label for="subtitulo">Subtítulo</label>
            <input 
              id="subtitulo"
              type="text"
              formControlName="subtitulo"
              placeholder="Subtítulo opcional" />
          </div>

          <div class="form-group">
            <label for="imagenUrl">URL de Imagen</label>
            <input 
              id="imagenUrl"
              type="url"
              formControlName="imagenUrl"
              placeholder="https://ejemplo.com/imagen.jpg" />
            <small class="text-muted">URL completa de la imagen del banner</small>
            <img 
              *ngIf="form.value.imagenUrl" 
              [src]="form.value.imagenUrl" 
              alt="Vista previa"
              class="image-preview"
              (error)="$event.target.style.display='none'" />
          </div>

          <div class="form-group">
            <label for="enlaceAccion">Enlace de Acción</label>
            <input 
              id="enlaceAccion"
              type="url"
              formControlName="enlaceAccion"
              placeholder="https://ejemplo.com/destino" />
            <small class="text-muted">URL a la que redirige el banner cuando se hace clic</small>
          </div>

          <div class="form-group">
            <label>
              <input 
                type="checkbox" 
                formControlName="activo" />
              <span style="margin-left: var(--spacing-sm);">Banner activo</span>
            </label>
            <small class="text-muted" style="display: block; margin-top: var(--spacing-xs);">
              Solo los banners activos se mostrarán en el sitio web
            </small>
          </div>

          <div class="form-actions">
            <button 
              class="btn" 
              type="submit" 
              [disabled]="form.invalid || saving"
              [attr.aria-busy]="saving">
              <span *ngIf="!saving">💾 {{isEdit ? 'Actualizar' : 'Crear'}} Banner</span>
              <span *ngIf="saving">Guardando...</span>
            </button>
            <a routerLink="/admin/banners" class="btn btn-outline">
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
export class AdminBannersFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  loading = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private service: AdminBannersService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      subtitulo: [''],
      imagenUrl: [''],
      enlaceAccion: [''],
      orden: [1, [Validators.min(1)]],
      activo: [true]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.load(id);
    }
  }

  load(id: string) {
    this.loading = true;
    this.service.get(id).subscribe({
      next: (banner: Banner) => {
        this.form.patchValue({
          titulo: banner.titulo,
          subtitulo: banner.subtitulo || '',
          imagenUrl: banner.imagenUrl || '',
          enlaceAccion: banner.enlaceAccion || '',
          orden: banner.orden || 1,
          activo: banner.activo
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error al cargar banner');
        this.router.navigate(['/admin/banners']);
      }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const values = this.form.value;

    const data = {
      titulo: values.titulo,
      subtitulo: values.subtitulo || undefined,
      imagenUrl: values.imagenUrl || undefined,
      enlaceAccion: values.enlaceAccion || undefined,
      orden: values.orden || 1,
      activo: values.activo !== false
    };

    const obs = this.isEdit 
      ? this.service.update(this.route.snapshot.paramMap.get('id')!, data)
      : this.service.create(data);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.toast.success(`Banner ${this.isEdit ? 'actualizado' : 'creado'} exitosamente`);
        this.router.navigate(['/admin/banners']);
      },
      error: (err) => {
        this.saving = false;
        const message = err?.error?.error || `Error al ${this.isEdit ? 'actualizar' : 'crear'} banner`;
        this.toast.error(message);
      }
    });
  }
}



