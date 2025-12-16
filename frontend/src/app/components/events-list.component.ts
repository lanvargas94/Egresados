import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="container">
    <h2>Eventos</h2>
    
    <div *ngIf="items.length === 0 && !loading" class="card" style="text-align: center; padding: 2rem;">
      <p>No hay eventos disponibles.</p>
    </div>

    <div *ngIf="loading" class="card" style="text-align: center; padding: 2rem;">
      <p>Cargando...</p>
    </div>
    
    <div class="card" *ngFor="let e of items" style="margin-bottom: 1rem;">
      <h3 style="margin: 0 0 0.5rem 0; color: #1976d2;">{{e.nombre || e.titulo || 'Sin nombre'}}</h3>
      <div style="margin-bottom: 0.5rem;">
        <p style="margin: 0.25rem 0; color: #666;">
          <strong>Tipo:</strong> {{getTipoEvento(e.tipoEvento)}}
        </p>
        <p style="margin: 0.25rem 0; color: #666;" *ngIf="e.fechaHoraInicio">
          <strong>Inicio:</strong> {{formatDate(e.fechaHoraInicio)}}
        </p>
        <p style="margin: 0.25rem 0; color: #666;" *ngIf="e.fechaHoraFin">
          <strong>Fin:</strong> {{formatDate(e.fechaHoraFin)}}
        </p>
        <p style="margin: 0.25rem 0; color: #666;">
          <strong>Lugar:</strong> {{e.lugarFisico || e.enlaceConexion || 'No especificado'}}
        </p>
        <p *ngIf="e.capacidad" style="margin: 0.25rem 0; color: #666;">
          <strong>Cupos:</strong> {{e.capacidad}} — <strong>Restantes:</strong> {{e.restantes<0? 'N/A' : e.restantes}}
        </p>
      </div>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button class="btn" *ngIf="!e.hasRsvp" (click)="rsvp(e)" [disabled]="e.restantes===0">Confirmar asistencia</button>
        <button class="btn" *ngIf="e.hasRsvp" style="background:#666" (click)="cancel(e)">Cancelar asistencia</button>
        <button class="btn" (click)="waitlist(e)" *ngIf="e.restantes===0">Unirme a lista de espera</button>
      </div>
    </div>
  </div>`
})
export class EventsListComponent implements OnInit {
  items: any[] = [];
  loading = false;
  constructor(private api: ApiService, private toasts: ToastService) {}
  ngOnInit() { this.load(); }
  load(){ 
    this.loading = true;
    this.api.get('/events').subscribe({
      next: (res: any) => {
        this.items = res.items || res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  rsvp(e:any){ this.api.post(`/events/${e.id}/rsvp`, {}).subscribe({ next: ()=> { this.toasts.success('Asistencia confirmada'); this.load(); }, error: (er:any)=> this.toasts.error(er?.error?.error || 'Error') }); }
  cancel(e:any){ this.api.delete(`/events/${e.id}/rsvp`).subscribe({ next: ()=> { this.toasts.success('Asistencia cancelada'); this.load(); }, error: (er:any)=> this.toasts.error(er?.error?.error || 'Error') }); }
  waitlist(e:any){ this.api.post(`/events/${e.id}/waitlist`, {}).subscribe({ next: ()=> this.toasts.success('Añadido a lista de espera'), error: ()=> this.toasts.error('Error') }); }
  
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
