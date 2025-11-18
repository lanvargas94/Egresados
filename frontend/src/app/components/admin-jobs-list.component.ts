import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin-jobs-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="container">
    <h2>Empleos (Admin)</h2>
    <form [formGroup]="f" (ngSubmit)="load()" class="card">
      <label>Estado</label>
      <select formControlName="estado"><option value="">(Todos)</option><option>BORRADOR</option><option>PUBLICADA</option><option>VENCIDA</option><option>ARCHIVADA</option></select>
      <button class="btn" type="submit">Filtrar</button>
    </form>
    <div class="card" *ngFor="let j of items">
      <b>{{j.titulo}}</b> — {{j.empresa}} — {{j.estado}}
      <div>
        <button class="btn" (click)="publish(j.id)">Publicar</button>
        <button class="btn" style="background:#666" (click)="archive(j.id)">Archivar</button>
        <button class="btn" style="background:#b00020" (click)="remove(j.id)">Eliminar</button>
      </div>
    </div>
    <button class="btn" (click)="prev()" [disabled]="page===0">Prev</button>
    <button class="btn" (click)="next()" [disabled]="(page+1)*this.size>=total">Next</button>
  </div>`
})
export class AdminJobsListComponent implements OnInit {
  items:any[]=[]; total=0; page=0; size=10; f=this.fb.group({estado:['']});
  constructor(private api: ApiService, private fb: FormBuilder, private toasts: ToastService) {}
  ngOnInit(){ this.load(); }
  load(){ const estado=this.f.value.estado||''; this.api.get(`/admin/jobs?page=${this.page}&size=${this.size}${estado?`&estado=${estado}`:''}`).subscribe((res:any)=>{ this.items=res.items; this.total=res.total; }); }
  prev(){ if(this.page>0){ this.page--; this.load(); } }
  next(){ if((this.page+1)*this.size<this.total){ this.page++; this.load(); } }
  publish(id:string){ if(!confirm('¿Publicar esta oferta?')) return; this.api.post(`/admin/jobs/${id}/publish`,{}).subscribe(()=>{ this.toasts.success('Publicada'); this.load(); }); }
  archive(id:string){ if(!confirm('¿Archivar esta oferta?')) return; this.api.post(`/admin/jobs/${id}/archive`,{}).subscribe(()=>{ this.toasts.success('Archivada'); this.load(); }); }
  remove(id:string){ if(!confirm('¿Eliminar definitivamente esta oferta?')) return; this.api.delete(`/admin/jobs/${id}`).subscribe(()=>{ this.toasts.success('Eliminada'); this.load(); }); }
}
