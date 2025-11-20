import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { CatalogService } from '../services/catalog.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-admin-news-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  template: `
  <div class="container">
    <div class="card">
      <h2>{{id? 'Editar' : 'Crear'}} Noticia</h2>
      <form [formGroup]="f" (ngSubmit)="save()">
        <div>
          <label>Título <span style="color: red;">*</span></label>
          <input formControlName="titulo" [class.error]="f.get('titulo')?.invalid && f.get('titulo')?.touched" />
          <small *ngIf="f.get('titulo')?.invalid && f.get('titulo')?.touched" style="color: red;">
            El título es obligatorio
          </small>
        </div>

        <div>
          <label>Resumen corto <span style="color: #666;">(opcional para borradores)</span></label>
          <input formControlName="resumen" [class.error]="f.get('resumen')?.invalid && f.get('resumen')?.touched" maxlength="500" />
          <small *ngIf="f.get('resumen')?.invalid && f.get('resumen')?.touched" style="color: red;">
            El resumen no puede exceder 500 caracteres
          </small>
          <small style="color: #666;">Máximo 500 caracteres. Requerido para publicar.</small>
        </div>

        <div>
          <label>Contenido (HTML) <span style="color: #666;">(opcional para borradores)</span></label>
          <textarea formControlName="cuerpoHtml" rows="8" style="width:100%" (input)="updatePreview()" 
                    [class.error]="f.get('cuerpoHtml')?.invalid && f.get('cuerpoHtml')?.touched"></textarea>
          <small *ngIf="f.get('cuerpoHtml')?.invalid && f.get('cuerpoHtml')?.touched" style="color: red;">
            Error en el contenido
          </small>
          <small style="color: #666;">Requerido para publicar.</small>
        </div>

        <div>
          <label><input type="checkbox" [(ngModel)]="preview" /> Vista previa</label>
          <div *ngIf="preview" class="card" [innerHTML]="safeHtml" style="margin-top:8px;background:#fff;padding:1rem;border:1px solid #ddd"></div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label>Facultad (opcional)</label>
            <select formControlName="facultad" (change)="onFacultyChange($event.target.value)">
              <option value="">(No segmentar)</option>
              <option *ngFor="let fa of faculties" [value]="fa.name">{{fa.name}}</option>
            </select>
          </div>
          <div>
            <label>Programa (opcional)</label>
            <select formControlName="programa">
              <option value="">(Todos)</option>
              <option *ngFor="let p of programs" [value]="p">{{p}}</option>
            </select>
          </div>
        </div>

        <div>
          <label>Fecha de publicación</label>
          <input type="datetime-local" formControlName="fechaPublicacion" [class.error]="fechaError" />
          <small *ngIf="fechaError" style="color: red;">
            Para programar, la fecha debe ser futura
          </small>
          <small style="color: #666;">Obligatoria si se programa o publica</small>
        </div>

        <div>
          <label>Enlace externo (opcional)</label>
          <input formControlName="enlaceExterno" type="url" placeholder="https://..." />
        </div>

        <div style="margin-top:8px">
          <label>Imagen (JPG/PNG, opcional)</label>
          <input type="file" accept="image/jpeg,image/png" (change)="upload($event, 'image')" />
          <div *ngIf="news?.imagenUrl" style="margin-top:8px">
            <img [src]="news.imagenUrl" alt="imagen" style="max-width:300px;border:1px solid #ddd;border-radius:6px"/>
            <button class="btn" type="button" (click)="deleteFile('image')" style="background:#b00020;margin-left:8px">Eliminar imagen</button>
          </div>
        </div>

        <div style="margin-top:8px">
          <label>Adjunto (PDF/DOC/DOCX, opcional)</label>
          <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                 (change)="upload($event, 'attachment')" />
          <small style="color: #666; display: block; margin-top: 0.25rem;">
            Formatos permitidos: PDF, DOC, DOCX. Tamaño máximo: 5 MB
          </small>
          <div *ngIf="attachmentError" style="color: red; margin-top: 0.5rem; font-size: 0.9rem;">
            {{attachmentError}}
          </div>
          <div *ngIf="news?.adjuntoUrl" style="margin-top:8px; padding: 0.75rem; background: #f5f5f5; border-radius: 4px; display: flex; align-items: center; gap: 0.5rem;">
            <span>📎</span>
            <a [href]="news.adjuntoUrl" target="_blank" style="flex: 1; text-decoration: none; color: #2196F3;">
              Ver adjunto
            </a>
            <button class="btn" type="button" (click)="deleteFile('attachment')" style="background:#b00020; padding: 0.25rem 0.75rem; font-size: 0.85rem;">
              Eliminar
            </button>
          </div>
        </div>

        <div style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
          <small style="color: #666;">
            <span style="color: red;">*</span> Título es obligatorio para guardar.<br>
            Resumen y contenido son requeridos para publicar.
          </small>
        </div>

        <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn" type="submit" [disabled]="!canSave() || saving">
            {{saving ? 'Guardando...' : 'Guardar'}}
          </button>
          <button class="btn" type="button" (click)="schedule()" [disabled]="!id || !canSchedule()" 
                  style="background: #2196F3;">
            Programar
          </button>
          <button class="btn" type="button" (click)="publish()" [disabled]="!id || !canPublish()" 
                  style="background: #4caf50;">
            Publicar
          </button>
          <a class="btn" routerLink="/admin/news" style="background: #666; text-decoration: none;">
            Cancelar
          </a>
        </div>
      </form>
    </div>
  </div>
  `,
  styles: [`
    .error {
      border-color: red !important;
    }
    input[type="datetime-local"] {
      padding: 0.5rem;
    }
  `]
})
export class AdminNewsFormComponent implements OnInit {
  id: string | null = null; saving=false; faculties:any[]=[]; programs:string[]=[]; news:any=null;
  preview: boolean = false; safeHtml: SafeHtml | null = null;
  f = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(1)]],
    resumen: ['', [Validators.maxLength(500)]], // Resumen no obligatorio para borradores
    cuerpoHtml: [''], // Contenido no obligatorio para borradores
    fechaPublicacion: [''],
    enlaceExterno: [''],
    facultad: [''], programa: ['']
  });
  fechaError = false;
  attachmentError: string | null = null;
  constructor(private fb: FormBuilder, private api: ApiService, private route: ActivatedRoute, private router: Router, private toast: ToastService, private catalog: CatalogService, private sanitizer: DomSanitizer) {}
  ngOnInit(){ this.id = this.route.snapshot.paramMap.get('id'); this.catalog.faculties().subscribe((res:any)=>this.faculties=res); if(this.id){ this.fetch(); } }
  fetch(){ 
    this.api.get(`/admin/news/${this.id}`).subscribe((n:any)=>{ 
      this.news=n; 
      this.f.patchValue({ 
        titulo:n.titulo || '', 
        resumen:n.resumen || '', 
        cuerpoHtml:n.cuerpoHtml || '', 
        fechaPublicacion: n.fechaPublicacion? n.fechaPublicacion.substring(0,16):'', 
        enlaceExterno:n.enlaceExterno || '', 
        facultad:n.facultad||'', 
        programa:n.programa||''
      }); 
      if(n.facultad){ this.onFacultyChange(n.facultad); } 
    }); 
  }
  onFacultyChange(faculty:string){ this.programs=[]; if(faculty){ this.catalog.programs(faculty).subscribe((res:any)=>this.programs=res); this.f.patchValue({ programa: '' }); } }
  save(){ 
    // Solo validar título para guardar borrador
    const titulo = (this.f.value.titulo || '').toString().trim();
    if (!titulo) {
      this.toast.error('El título es obligatorio');
      this.f.get('titulo')?.markAsTouched();
      return;
    }
    this.saving=true; 
    
    // Preparar el body, convirtiendo strings vacíos a null
    const body: any = {
      titulo: titulo,
      resumen: (this.f.value.resumen && (this.f.value.resumen + '').trim()) ? (this.f.value.resumen + '').trim() : null,
      cuerpoHtml: (this.f.value.cuerpoHtml && (this.f.value.cuerpoHtml + '').trim()) ? (this.f.value.cuerpoHtml + '').trim() : null,
      facultad: (this.f.value.facultad && (this.f.value.facultad + '').trim()) ? (this.f.value.facultad + '').trim() : null,
      programa: (this.f.value.programa && (this.f.value.programa + '').trim()) ? (this.f.value.programa + '').trim() : null,
      enlaceExterno: (this.f.value.enlaceExterno && (this.f.value.enlaceExterno + '').trim()) ? (this.f.value.enlaceExterno + '').trim() : null,
      fechaPublicacion: this.f.value.fechaPublicacion || null
    };
    
    // Si hay fecha, convertirla a formato ISO
    if (body.fechaPublicacion) {
      try {
        const date = new Date(body.fechaPublicacion);
        if (!isNaN(date.getTime())) {
          body.fechaPublicacion = date.toISOString();
        } else {
          body.fechaPublicacion = null;
        }
      } catch (e) {
        body.fechaPublicacion = null;
      }
    }
    
    const req = this.id ? this.api.put(`/admin/news/${this.id}`, body) : this.api.post('/admin/news', body); 
    req.subscribe({ 
      next: (res:any)=>{ 
        this.saving=false; 
        this.toast.success('Noticia guardada como borrador'); 
        if(!this.id){ 
          this.id=res.id; 
          this.router.navigate(['/admin/news', res.id]);
        } else {
          this.fetch(); 
        }
      }, 
      error: (err: any)=>{ 
        this.saving=false; 
        const errorMsg = err.error?.error || err.message || 'Error al guardar';
        this.toast.error(errorMsg);
        console.error('Error al guardar noticia:', err);
      } 
    }); 
  }
  upload(ev:any, type:'image'|'attachment'){
    if(!this.id){ this.toast.error('Primero guarda para obtener ID'); return; }
    const file = ev.target.files?.[0]; if(!file) return;
    
    // Validaciones para adjuntos
    if (type === 'attachment') {
      this.attachmentError = null;
      const maxSize = 5 * 1024 * 1024; // 5 MB
      if (file.size > maxSize) {
        this.attachmentError = 'El archivo excede el tamaño máximo de 5 MB';
        ev.target.value = ''; // Limpiar el input
        return;
      }
      const fileName = file.name.toLowerCase();
      const validExtensions = ['.pdf', '.doc', '.docx'];
      const isValid = validExtensions.some(ext => fileName.endsWith(ext));
      if (!isValid) {
        this.attachmentError = 'Solo se permiten archivos PDF, DOC o DOCX';
        ev.target.value = ''; // Limpiar el input
        return;
      }
    }
    
    // Confirmación si ya existe archivo
    if (type==='image' && this.news?.imagenUrl) {
      if (!window.confirm('Reemplazar la imagen existente?')) return;
    }
    if (type==='attachment' && this.news?.adjuntoUrl) {
      if (!window.confirm('Reemplazar el adjunto existente?')) return;
    }
    const form = new FormData(); form.append('file', file);
    const url = type==='image'? `/admin/news/${this.id}/upload-image` : `/admin/news/${this.id}/upload-attachment`;
    this.api.post(url, form).subscribe({ 
      next: ()=> { 
        this.toast.success('Archivo subido correctamente'); 
        this.attachmentError = null;
        this.fetch(); 
      }, 
      error: (err: any)=> {
        const errorMsg = err.error?.error || 'Error al subir archivo';
        this.toast.error(errorMsg);
        if (type === 'attachment') {
          this.attachmentError = errorMsg;
        }
      } 
    });
  }
  deleteFile(type:'image'|'attachment'){
    if(!this.id) return;
    if (!window.confirm('¿Seguro que deseas eliminar este archivo?')) return;
    const url = type==='image'? `/admin/news/${this.id}/delete-image` : `/admin/news/${this.id}/delete-attachment`;
    this.api.post(url,{}).subscribe({ next: ()=>{ this.toast.success('Archivo eliminado'); this.fetch(); }, error: ()=> this.toast.error('Error al eliminar') });
  }
  canSave(): boolean {
    const v = this.f.value as any;
    return !!(v.titulo && (v.titulo + '').trim() !== '');
  }

  canPublish(): boolean {
    const v = this.f.value as any;
    return !!(v.titulo && v.resumen && v.cuerpoHtml && 
             (v.titulo + '').trim() !== '' && 
             (v.resumen + '').trim() !== '' && 
             (v.cuerpoHtml + '').trim() !== '');
  }

  canSchedule(): boolean {
    const v = this.f.value as any;
    if (!v.fechaPublicacion) return false;
    const fecha = new Date(v.fechaPublicacion);
    const ahora = new Date();
    return fecha > ahora;
  }

  prevalidatePublish(): boolean {
    const v = this.f.value as any;
    if (!v.titulo || !v.resumen || !v.cuerpoHtml || 
        (v.titulo + '').trim() === '' || 
        (v.resumen + '').trim() === '' || 
        (v.cuerpoHtml + '').trim() === '') {
      this.toast.error('Título, resumen y contenido son obligatorios para publicar');
      return false;
    }
    return true;
  }

  publish(){ 
    if(!this.id) return; 
    if(!this.prevalidatePublish()) return; 
    this.api.post(`/admin/news/${this.id}/publish`,{}).subscribe({ 
      next: ()=>{ 
        this.toast.success('Noticia publicada'); 
        this.fetch(); 
      }, 
      error: (err: any)=> {
        const msg = err.error?.error || 'Error al publicar';
        this.toast.error(msg);
      }
    }); 
  }

  schedule(){ 
    if(!this.id) return; 
    const dt = this.f.value.fechaPublicacion; 
    if(!dt){ 
      this.toast.error('Fecha de publicación requerida para programar'); 
      return; 
    }
    const fecha = new Date(dt as string);
    const ahora = new Date();
    if (fecha <= ahora) {
      this.fechaError = true;
      this.toast.error('La fecha de publicación debe ser futura para programar');
      return;
    }
    this.fechaError = false;
    const iso = new Date(dt as string).toISOString(); 
    this.api.post(`/admin/news/${this.id}/schedule?fecha=${encodeURIComponent(iso)}`,{}).subscribe({ 
      next: ()=> {
        this.toast.success('Noticia programada'); 
        this.fetch();
      }, 
      error: (err: any)=> {
        const msg = err.error?.error || 'Error al programar';
        this.toast.error(msg);
      }
    }); 
  }
  updatePreview(){ const html = this.f.value.cuerpoHtml || ''; this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(String(html)); }
}
