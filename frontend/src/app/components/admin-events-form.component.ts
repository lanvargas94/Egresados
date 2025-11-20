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
      <label>Nombre del Evento</label>
      <input formControlName="nombre" />
      <label>Tipo de Evento</label>
      <select formControlName="tipoEvento">
        <option value="PRESENCIAL">Presencial</option>
        <option value="VIRTUAL">Virtual</option>
      </select>
      <label>Fecha y hora de inicio</label>
      <input type="datetime-local" formControlName="fechaHoraInicio" />
      <label>Fecha y hora de fin</label>
      <input type="datetime-local" formControlName="fechaHoraFin" />
      <label>Lugar físico (si es presencial)</label>
      <input formControlName="lugarFisico" />
      <label>Enlace de conexión (si es virtual)</label>
      <input formControlName="enlaceConexion" />
      <label>Descripción</label>
      <textarea formControlName="descripcion" rows="5" style="width:100%"></textarea>
      <label>Capacidad (opcional)</label>
      <input type="number" formControlName="capacidad" min="1" />
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
  f = this.fb.group({ 
    nombre:['', Validators.required], 
    tipoEvento:['PRESENCIAL', Validators.required],
    fechaHoraInicio:['', Validators.required], 
    fechaHoraFin:['', Validators.required],
    lugarFisico:[''], 
    enlaceConexion:[''], 
    descripcion:[''], 
    capacidad:[null] 
  });
  constructor(private fb: FormBuilder, private api: ApiService, private route: ActivatedRoute, private toast: ToastService) {}
  ngOnInit(){ 
    this.id = this.route.snapshot.paramMap.get('id'); 
    if(this.id){ 
      this.api.get(`/admin/events/${this.id}`).subscribe((e:any)=>{ 
        const formatDateTime = (dt: string) => dt ? dt.substring(0,16) : '';
        this.f.patchValue({ 
          nombre: e.nombre || e.titulo || '', 
          tipoEvento: e.tipoEvento || 'PRESENCIAL',
          fechaHoraInicio: formatDateTime(e.fechaHoraInicio || e.fechaHora || ''), 
          fechaHoraFin: formatDateTime(e.fechaHoraFin || ''), 
          lugarFisico: e.lugarFisico || e.lugar || '', 
          enlaceConexion: e.enlaceConexion || e.enlaceVirtual || '', 
          descripcion: e.descripcion || '', 
          capacidad: e.capacidad || e.cupos || null 
        }); 
      }); 
    } 
  }
  save(){ 
    this.saving=true; 
    const b=this.f.value; 
    const body:any = { 
      nombre: b.nombre,
      tipoEvento: b.tipoEvento,
      fechaHoraInicio: b.fechaHoraInicio ? new Date(b.fechaHoraInicio as string).toISOString() : null,
      fechaHoraFin: b.fechaHoraFin ? new Date(b.fechaHoraFin as string).toISOString() : null,
      lugarFisico: b.lugarFisico || null,
      enlaceConexion: b.enlaceConexion || null,
      descripcion: b.descripcion || null,
      capacidad: b.capacidad || null
    }; 
    const req = this.id? this.api.put(`/admin/events/${this.id}`, body) : this.api.post('/admin/events', body); 
    req.subscribe({ 
      next: (res:any)=>{ 
        this.saving=false; 
        this.toast.success('Guardado'); 
        if(!this.id){ 
          this.id=res.id; 
        } 
      }, 
      error: (e:any)=>{ 
        this.saving=false; 
        this.toast.error(e?.error?.error || 'Error al guardar'); 
      } 
    }); 
  }
  publish(){ 
    if(!this.id) return; 
    if(!confirm('¿Publicar evento?')) return; 
    this.api.post(`/admin/events/${this.id}/publish`,{}).subscribe({ 
      next: ()=> this.toast.success('Publicado'), 
      error: (e:any)=> this.toast.error(e?.error?.error || 'Error al publicar') 
    }); 
  }
  archive(){ 
    if(!this.id) return; 
    if(!confirm('¿Archivar evento?')) return; 
    this.api.post(`/admin/events/${this.id}/archive`,{}).subscribe({ 
      next: ()=> this.toast.success('Archivado'), 
      error: (e:any)=> this.toast.error(e?.error?.error || 'Error al archivar') 
    }); 
  }
  cancelRsvp(){ 
    if(!this.id || !this.gradId) { 
      this.toast.error('GraduateId requerido'); 
      return; 
    } 
    if(!confirm('¿Cancelar RSVP de este egresado?')) return; 
    this.api.delete(`/admin/events/${this.id}/rsvp?graduateId=${encodeURIComponent(this.gradId)}`).subscribe({ 
      next: ()=> this.toast.success('RSVP cancelado'), 
      error: (e:any)=> this.toast.error(e?.error?.error || 'Error') 
    }); 
  }
}
