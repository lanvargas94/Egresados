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
    <div class="card" *ngFor="let e of items">
      <h3>{{e.titulo}}</h3>
      <p>{{e.fechaHora}} — {{e.lugar || e.enlaceVirtual}}</p>
      <p *ngIf="e.cupos">Cupos: {{e.cupos}} — Restantes: {{e.restantes<0? 'N/A' : e.restantes}}</p>
      <div>
        <button class="btn" *ngIf="!e.hasRsvp" (click)="rsvp(e)" [disabled]="e.restantes===0">Confirmar asistencia</button>
        <button class="btn" *ngIf="e.hasRsvp" style="background:#666" (click)="cancel(e)">Cancelar asistencia</button>
        <button class="btn" (click)="waitlist(e)" *ngIf="e.restantes===0">Unirme a lista de espera</button>
      </div>
    </div>
  </div>`
})
export class EventsListComponent implements OnInit {
  items: any[] = [];
  constructor(private api: ApiService, private toasts: ToastService) {}
  ngOnInit() { this.load(); }
  load(){ this.api.get('/events').subscribe((res: any) => this.items = res.items || res); }
  rsvp(e:any){ this.api.post(`/events/${e.id}/rsvp`, {}).subscribe({ next: ()=> { this.toasts.success('Asistencia confirmada'); this.load(); }, error: (er:any)=> this.toasts.error(er?.error?.error || 'Error') }); }
  cancel(e:any){ this.api.delete(`/events/${e.id}/rsvp`).subscribe({ next: ()=> { this.toasts.success('Asistencia cancelada'); this.load(); }, error: (er:any)=> this.toasts.error(er?.error?.error || 'Error') }); }
  waitlist(e:any){ this.api.post(`/events/${e.id}/waitlist`, {}).subscribe({ next: ()=> this.toasts.success('Añadido a lista de espera'), error: ()=> this.toasts.error('Error') }); }
}
