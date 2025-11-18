import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { RouterModule } from '@angular/router';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin-events-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <div class="container">
    <h2>Eventos (Admin)</h2>
    <form [formGroup]="f" (ngSubmit)="load()" class="card">
      <label>Estado</label>
      <select formControlName="estado"><option value="">(Todos)</option><option>BORRADOR</option><option>PUBLICADA</option><option>FINALIZADA</option><option>ARCHIVADA</option></select>
      <button class="btn" type="submit">Filtrar</button>
      <a class="btn" routerLink="/admin/events/new" style="margin-left:8px">Nuevo</a>
    </form>
    <div class="card" *ngFor="let e of items">
      <b>{{e.titulo}}</b> — {{e.estado}} — {{e.fechaHora}}
      <div>
        <a class="btn" [routerLink]="['/admin/events', e.id]">Editar</a>
        <button class="btn" (click)="publish(e.id)">Publicar</button>
        <button class="btn" style="background:#666" (click)="archive(e.id)">Archivar</button>
      </div>
    </div>
    <button class="btn" (click)="prev()" [disabled]="page===0">Prev</button>
    <button class="btn" (click)="next()" [disabled]="(page+1)*size>=total">Next</button>
  </div>
  `
})
export class AdminEventsListComponent implements OnInit {
  items:any[]=[]; total=0; page=0; size=10; f=this.fb.group({estado:['']});
  constructor(private api: ApiService, private fb: FormBuilder, private toasts: ToastService) {}
  ngOnInit(){ this.load(); }
  load(){ const estado=this.f.value.estado||''; this.api.get(`/admin/events?page=${this.page}&size=${this.size}${estado?`&estado=${estado}`:''}`).subscribe((res:any)=>{ this.items=res.items; this.total=res.total; }); }
  prev(){ if(this.page>0){ this.page--; this.load(); } }
  next(){ if((this.page+1)*this.size<this.total){ this.page++; this.load(); } }
  publish(id:string){ if(!confirm('¿Publicar evento?')) return; this.api.post(`/admin/events/${id}/publish`,{}).subscribe(()=>{ this.toasts.success('Publicado'); this.load(); }); }
  archive(id:string){ if(!confirm('¿Archivar evento?')) return; this.api.post(`/admin/events/${id}/archive`,{}).subscribe(()=>{ this.toasts.success('Archivado'); this.load(); }); }
}

