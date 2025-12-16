import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { RouterModule } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

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
    <div class="card" *ngFor="let e of items" style="margin-bottom: 1rem;">
      <div style="margin-bottom: 0.5rem;">
        <h3 style="margin: 0 0 0.5rem 0; color: #1976d2;">{{e.nombre || e.titulo || 'Sin nombre'}}</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; color: #666; font-size: 0.9rem; margin-bottom: 0.5rem;">
          <span><strong>Tipo:</strong> {{getTipoEvento(e.tipoEvento)}}</span>
          <span><strong>Estado:</strong> {{e.estado}}</span>
          <span *ngIf="e.inscritos !== undefined"><strong>Confirmados:</strong> {{e.inscritos}}</span>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; color: #666; font-size: 0.9rem;">
          <span *ngIf="e.fechaHoraInicio"><strong>Inicio:</strong> {{formatDate(e.fechaHoraInicio)}}</span>
          <span *ngIf="e.fechaHoraFin"><strong>Fin:</strong> {{formatDate(e.fechaHoraFin)}}</span>
        </div>
      </div>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <a class="btn" [routerLink]="['/admin/events', e.id]">Editar</a>
        <button class="btn" (click)="publish(e.id)" *ngIf="e.estado === 'BORRADOR'">Publicar</button>
        <button class="btn" style="background:#b00020" (click)="delete(e.id)">Eliminar</button>
        <button class="btn" (click)="downloadReport(e.id)" style="background: #4caf50; display: inline-flex; align-items: center; gap: 0.5rem;" title="Descargar reporte de asistentes">
          <span>📥</span>
          <span>Descargar reporte</span>
        </button>
      </div>
    </div>
    
    <div *ngIf="items.length === 0 && !loading" class="card" style="text-align: center; padding: 2rem;">
      <p>No hay eventos disponibles para el estado seleccionado.</p>
    </div>

    <div *ngIf="loading" class="card" style="text-align: center; padding: 2rem;">
      <p>Cargando...</p>
    </div>
    
    <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem;">
      <button class="btn" (click)="prev()" [disabled]="page===0 || loading">Anterior</button>
      <span style="padding: 0.5rem 1rem; display: inline-block;">
        Página {{page + 1}} de {{totalPages}} ({{total}} total)
      </span>
      <button class="btn" (click)="next()" [disabled]="(page+1)*size>=total || loading">Siguiente</button>
    </div>
  </div>
  `
})
export class AdminEventsListComponent implements OnInit {
  items:any[]=[]; total=0; page=0; size=10; loading=false; f=this.fb.group({estado:['']});
  constructor(private api: ApiService, private fb: FormBuilder, private toasts: ToastService, private http: HttpClient) {}
  ngOnInit(){ this.load(); }
  
  get totalPages(): number {
    return Math.ceil(this.total / this.size);
  }
  load(){ 
    this.loading = true;
    const estado=this.f.value.estado||''; 
    this.api.get(`/admin/events?page=${this.page}&size=${this.size}${estado?`&estado=${estado}`:''}`).subscribe({
      next: (res:any) => { 
        this.items=res.items || []; 
        this.total=res.total || 0;
        this.loading = false;
        // Cargar estadísticas de confirmados para cada evento
        this.items.forEach((e: any) => {
          this.loadStats(e.id).then((stats: any) => {
            e.inscritos = stats.inscritos || 0;
          });
        });
      },
      error: () => {
        this.loading = false;
      }
    }); 
  }
  
  loadStats(eventId: string): Promise<any> {
    return new Promise((resolve) => {
      this.api.get(`/admin/events/${eventId}/stats`).subscribe({
        next: (res: any) => resolve(res),
        error: () => resolve({ inscritos: 0 })
      });
    });
  }
  
  downloadReport(eventId: string) {
    const token = localStorage.getItem('adminToken');
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    this.http.get(`${environment.apiUrl}/admin/events/${eventId}/attendees/export`, {
      responseType: 'blob',
      headers: headers
    }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `asistentes-${eventId}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.toasts.success('Reporte descargado correctamente');
      },
      error: (err: any) => {
        this.toasts.error('Error al descargar el reporte');
        console.error('Error al descargar reporte:', err);
      }
    });
  }
  prev(){ if(this.page>0 && !this.loading){ this.page--; this.load(); } }
  next(){ if((this.page+1)*this.size<this.total && !this.loading){ this.page++; this.load(); } }
  publish(id:string){ if(!confirm('¿Publicar evento?')) return; this.api.post(`/admin/events/${id}/publish`,{}).subscribe(()=>{ this.toasts.success('Publicado'); this.load(); }); }
  delete(id:string){ if(!confirm('¿Estás seguro de eliminar este evento? Esta acción no se puede deshacer.')) return; this.api.delete(`/admin/events/${id}`).subscribe({ next: ()=>{ this.toasts.success('Evento eliminado'); this.load(); }, error: (err:any)=>{ this.toasts.error(err?.error?.error || 'Error al eliminar evento'); } }); }
  
  getTipoEvento(tipo: string): string {
    if (!tipo) return 'No especificado';
    return tipo === 'VIRTUAL' ? 'Virtual' : tipo === 'PRESENCIAL' ? 'Presencial' : tipo;
  }
  
  formatDate(dateStr: string): string {
    if (!dateStr) return 'No especificada';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }
}

