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
  <div class="container"><div class="card">
    <h2>{{id? 'Editar' : 'Crear'}} Noticia</h2>
    <form [formGroup]="f" (ngSubmit)="save()">
      <label>Título</label>
      <input formControlName="titulo" />
      <label>Resumen</label>
      <input formControlName="resumen" />
      <label>Facultad (opcional)</label>
      <select formControlName="facultad" (change)="onFacultyChange($event.target.value)">
        <option value="">(No segmentar)</option>
        <option *ngFor="let fa of faculties" [value]="fa.name">{{fa.name}}</option>
      </select>
      <label>Programa (opcional)</label>
      <select formControlName="programa">
        <option value="">(Todos)</option>
        <option *ngFor="let p of programs" [value]="p">{{p}}</option>
      </select>
      <label>Fecha publicación</label>
      <input type="datetime-local" formControlName="fechaPublicacion" />
      <label>Enlace externo</label>
      <input formControlName="enlaceExterno" />
      <label>Cuerpo (HTML)</label>
      <textarea formControlName="cuerpoHtml" rows="6" style="width:100%" (input)="updatePreview()"></textarea>
      <label><input type="checkbox" [(ngModel)]="preview" /> Vista previa</label>
      <div *ngIf="preview" class="card" [innerHTML]="safeHtml" style="margin-top:8px;background:#fff"></div>
      <div style="margin-top:8px">
        <label>Imagen (JPG/PNG)</label>
        <input type="file" (change)="upload($event, 'image')" />
        <div *ngIf="news?.imagenUrl" style="margin-top:8px">
          <img [src]="news.imagenUrl" alt="imagen" style="max-width:300px;border:1px solid #ddd;border-radius:6px"/>
          <button class="btn" type="button" (click)="deleteFile('image')" style="background:#b00020;margin-left:8px">Eliminar imagen</button>
        </div>
      </div>
      <div style="margin-top:8px">
        <label>Adjunto (PDF/JPG/PNG)</label>
        <input type="file" (change)="upload($event, 'attachment')" />
        <div *ngIf="news?.adjuntoUrl" style="margin-top:8px">
          <a [href]="news.adjuntoUrl" target="_blank">Ver adjunto</a>
          <button class="btn" type="button" (click)="deleteFile('attachment')" style="background:#b00020;margin-left:8px">Eliminar adjunto</button>
        </div>
      </div>
      <button class="btn" type="submit" [disabled]="f.invalid || saving">Guardar</button>
      <button class="btn" type="button" (click)="schedule()" [disabled]="!id || !f.value.fechaPublicacion">Programar</button>
      <button class="btn" type="button" (click)="publish()" [disabled]="!id">Publicar</button>
    </form>
  </div></div>
  `
})
export class AdminNewsFormComponent implements OnInit {
  id: string | null = null; saving=false; faculties:any[]=[]; programs:string[]=[]; news:any=null;
  preview: boolean = false; safeHtml: SafeHtml | null = null;
  f = this.fb.group({
    titulo: ['', Validators.required],
    resumen: [''],
    cuerpoHtml: ['', Validators.required],
    fechaPublicacion: [''],
    enlaceExterno: [''],
    facultad: [''], programa: ['']
  });
  constructor(private fb: FormBuilder, private api: ApiService, private route: ActivatedRoute, private router: Router, private toast: ToastService, private catalog: CatalogService, private sanitizer: DomSanitizer) {}
  ngOnInit(){ this.id = this.route.snapshot.paramMap.get('id'); this.catalog.faculties().subscribe((res:any)=>this.faculties=res); if(this.id){ this.fetch(); } }
  fetch(){ this.api.get(`/admin/news/${this.id}`).subscribe((n:any)=>{ this.news=n; this.f.patchValue({ titulo:n.titulo, resumen:n.resumen, cuerpoHtml:n.cuerpoHtml, fechaPublicacion: n.fechaPublicacion? n.fechaPublicacion.substring(0,16):'', enlaceExterno:n.enlaceExterno, facultad:n.facultad||'', programa:n.programa||''}); if(n.facultad){ this.onFacultyChange(n.facultad); } }); }
  onFacultyChange(faculty:string){ this.programs=[]; if(faculty){ this.catalog.programs(faculty).subscribe((res:any)=>this.programs=res); this.f.patchValue({ programa: '' }); } }
  save(){ this.saving=true; const body = this.f.value; const req = this.id ? this.api.put(`/admin/news/${this.id}`, body) : this.api.post('/admin/news', body); req.subscribe({ next: (res:any)=>{ this.saving=false; this.toast.success('Guardado'); if(!this.id){ this.id=res.id; } this.fetch(); }, error: ()=>{ this.saving=false; this.toast.error('Error al guardar'); } }); }
  upload(ev:any, type:'image'|'attachment'){
    if(!this.id){ this.toast.error('Primero guarda para obtener ID'); return; }
    const file = ev.target.files?.[0]; if(!file) return;
    // Confirmación si ya existe archivo
    if (type==='image' && this.news?.imagenUrl) {
      if (!window.confirm('Reemplazar la imagen existente?')) return;
    }
    if (type==='attachment' && this.news?.adjuntoUrl) {
      if (!window.confirm('Reemplazar el adjunto existente?')) return;
    }
    const form = new FormData(); form.append('file', file);
    const url = type==='image'? `/admin/news/${this.id}/upload-image` : `/admin/news/${this.id}/upload-attachment`;
    this.api.post(url, form).subscribe({ next: ()=> { this.toast.success('Archivo subido'); this.fetch(); }, error: ()=> this.toast.error('Error al subir') });
  }
  deleteFile(type:'image'|'attachment'){
    if(!this.id) return;
    if (!window.confirm('¿Seguro que deseas eliminar este archivo?')) return;
    const url = type==='image'? `/admin/news/${this.id}/delete-image` : `/admin/news/${this.id}/delete-attachment`;
    this.api.post(url,{}).subscribe({ next: ()=>{ this.toast.success('Archivo eliminado'); this.fetch(); }, error: ()=> this.toast.error('Error al eliminar') });
  }
  // Prevalidación RN-AN01 en UI
  prevalidatePublish(): boolean {
    const v = this.f.value as any;
    if (!v.titulo || !v.cuerpoHtml || String(v.titulo).trim() === '' || String(v.cuerpoHtml).trim() === '') {
      this.toast.error('RN-AN01: Título y cuerpo requeridos');
      return false;
    }
    return true;
  }
  publish(){ if(!this.id) return; if(!this.prevalidatePublish()) return; this.api.post(`/admin/news/${this.id}/publish`,{}).subscribe({ next: ()=>{ this.toast.success('Publicada'); this.fetch(); }, error: ()=> this.toast.error('Error al publicar') }); }
  schedule(){ if(!this.id) return; const dt = this.f.value.fechaPublicacion; if(!dt){ this.toast.error('Fecha requerida'); return; } const iso = new Date(dt as string).toISOString(); this.api.post(`/admin/news/${this.id}/schedule?fecha=${encodeURIComponent(iso)}`,{}).subscribe({ next: ()=> this.toast.success('Programada'), error: ()=> this.toast.error('Error al programar') }); }
  updatePreview(){ const html = this.f.value.cuerpoHtml || ''; this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(String(html)); }
}
