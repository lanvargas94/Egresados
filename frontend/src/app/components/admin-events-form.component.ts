import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin-events-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  template: `
  <div class="container"><div class="card">
    <h2>{{id? 'Editar' : 'Crear'}} Evento</h2>
    <form [formGroup]="f" (ngSubmit)="save()">
      <label>Título</label>
      <input formControlName="titulo" />
      <label>Fecha y hora</label>
      <input type="datetime-local" formControlName="fechaHora" />
      <label>Lugar</label>
      <input formControlName="lugar" />
      <label>Enlace virtual</label>
      <input formControlName="enlaceVirtual" />
      <label>Descripción</label>
      <textarea formControlName="descripcion" rows="5" style="width:100%"></textarea>
      <label>Cupos (opcional)</label>
      <input type="number" formControlName="cupos" />
      <label>Cancelación hasta (horas)</label>
      <input type="number" formControlName="cancelacionHoras" />
      <div style="margin-top:8px">
        <button class="btn" type="submit" [disabled]="f.invalid || saving">Guardar</button>
        <button class="btn" type="button" (click)="publish()" [disabled]="!id">Publicar</button>
        <button class="btn" type="button" (click)="archive()" [disabled]="!id" style="background:#666">Archivar</button>
      </div>
    </form>
  </div>
  <div class="card" *ngIf="id">
    <h3>Cancelar RSVP de un egresado</h3>
    <label>GraduateId</label>
    <input [(ngModel)]="gradId" />
    <button class="btn" (click)="cancelRsvp()">Cancelar RSVP</button>
  </div>
  </div>
  `
})
export class AdminEventsFormComponent implements OnInit {
  id: string | null = null; saving=false; gradId='';
  f = this.fb.group({ titulo:['', Validators.required], fechaHora:['', Validators.required], lugar:[''], enlaceVirtual:[''], descripcion:[''], cupos:[null], cancelacionHoras:[0] });
  constructor(private fb: FormBuilder, private api: ApiService, private route: ActivatedRoute, private toast: ToastService) {}
  ngOnInit(){ this.id = this.route.snapshot.paramMap.get('id'); if(this.id){ this.api.get(`/api/admin/events/${this.id}`).subscribe((e:any)=>{ this.f.patchValue({ titulo:e.titulo, fechaHora:e.fechaHora? e.fechaHora.substring(0,16):'', lugar:e.lugar, enlaceVirtual:e.enlaceVirtual, descripcion:e.descripcion, cupos:e.cupos, cancelacionHoras:e.cancelacionHoras }); }); } }
  save(){ this.saving=true; const b=this.f.value; const body:any = { ...b, fechaHora: b.fechaHora? new Date(b.fechaHora as string).toISOString(): null }; const req = this.id? this.api.put(`/admin/events/${this.id}`, body) : this.api.post('/api/admin/events', body); req.subscribe({ next: (res:any)=>{ this.saving=false; this.toast.success('Guardado'); if(!this.id){ this.id=res.id; } }, error: ()=>{ this.saving=false; this.toast.error('Error'); } }); }
  publish(){ if(!this.id) return; if(!confirm('¿Publicar evento?')) return; this.api.post(`/api/admin/events/${this.id}/publish`,{}).subscribe({ next: ()=> this.toast.success('Publicado'), error: ()=> this.toast.error('Error') }); }
  archive(){ if(!this.id) return; if(!confirm('¿Archivar evento?')) return; this.api.post(`/api/admin/events/${this.id}/archive`,{}).subscribe({ next: ()=> this.toast.success('Archivado'), error: ()=> this.toast.error('Error') }); }
  cancelRsvp(){ if(!this.id || !this.gradId) { this.toast.error('GraduateId requerido'); return; } if(!confirm('¿Cancelar RSVP de este egresado?')) return; this.api.delete(`/api/admin/events/${this.id}/rsvp?graduateId=${encodeURIComponent(this.gradId)}`).subscribe({ next: ()=> this.toast.success('RSVP cancelado'), error: (e:any)=> this.toast.error(e?.error?.error || 'Error') }); }
}
