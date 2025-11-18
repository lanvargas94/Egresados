import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin-news-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="container">
    <h2>Noticias (Admin)</h2>
    <form [formGroup]="f" (ngSubmit)="load()" class="card">
      <label>Estado</label>
      <select formControlName="estado"><option value="">(Todos)</option><option>BORRADOR</option><option>PROGRAMADA</option><option>PUBLICADA</option><option>ARCHIVADA</option></select>
      <button class="btn" type="submit">Filtrar</button>
    </form>
    <div class="card" *ngFor="let n of items">
      <b>{{n.titulo}}</b> — {{n.estado}} — {{n.fechaPublicacion}}
      <div>
        <button class="btn" (click)="publish(n.id)">Publicar</button>
        <button class="btn" (click)="archive(n.id)" style="background:#666">Archivar</button>
        <button class="btn" (click)="remove(n.id)" style="background:#b00020">Eliminar</button>
      </div>
    </div>
    <button class="btn" (click)="prev()" [disabled]="page===0">Prev</button>
    <button class="btn" (click)="next()" [disabled]="(page+1)*size>=total">Next</button>
  </div>`
})
export class AdminNewsListComponent implements OnInit {
  items:any[]=[]; total=0; page=0; size=10; loading=false;
  f = this.fb.group({ estado: [''] });
  constructor(private api: ApiService, private fb: FormBuilder, private toasts: ToastService) {}
  ngOnInit() { this.load(); }
  load() {
    if (this.loading) return; this.loading=true;
    const estado = this.f.value.estado || '';
    this.api.get(`/admin/news?page=${this.page}&size=${this.size}${estado?`&estado=${estado}`:''}`).subscribe((res:any)=>{
      this.items=res.items; this.total=res.total; this.loading=false;
    });
  }
  prev(){ if(this.page>0){ this.page--; this.load();}}
  next(){ if((this.page+1)*this.size<this.total){ this.page++; this.load();}}
  publish(id:string){ if(!confirm('¿Publicar esta noticia?')) return; this.api.post(`/admin/news/${id}/publish`,{}).subscribe(()=>{ this.toasts.success('Publicada'); this.load();}); }
  archive(id:string){ if(!confirm('¿Archivar esta noticia?')) return; this.api.post(`/admin/news/${id}/archive`,{}).subscribe(()=>{ this.toasts.success('Archivada'); this.load();}); }
  remove(id:string){ if(!confirm('¿Eliminar definitivamente esta noticia?')) return; this.api.delete(`/admin/news/${id}`).subscribe(()=>{ this.toasts.success('Eliminada'); this.load();}); }
}
