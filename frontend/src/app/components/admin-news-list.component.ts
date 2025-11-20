import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin-news-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <div class="container">
    <h2>Noticias (Admin)</h2>
    <form [formGroup]="f" (ngSubmit)="load()" class="card">
      <div style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <label>Estado</label>
          <select formControlName="estado" style="width: 100%; padding: 0.5rem;">
            <option value="">(Todos)</option>
            <option>BORRADOR</option>
            <option>PROGRAMADA</option>
            <option>PUBLICADA</option>
            <option>ARCHIVADA</option>
          </select>
        </div>
        <button class="btn" type="submit" [disabled]="loading">
          {{loading ? 'Cargando...' : 'Filtrar'}}
        </button>
        <a class="btn" routerLink="/admin/news/new" style="background: #4caf50; color: white; text-decoration: none; margin-left: 8px;">
          Nueva
        </a>
      </div>
    </form>
    <div class="card" *ngIf="items.length === 0 && !loading">
      <p>No hay noticias disponibles para el estado seleccionado.</p>
    </div>
    <div class="card" *ngFor="let n of items">
      <div class="news-header">
        <h3>{{n.titulo || 'Sin título'}}</h3>
        <span class="news-status" 
              [ngClass]="{
                'status-borrador': n.estado === 'BORRADOR',
                'status-programada': n.estado === 'PROGRAMADA',
                'status-publicada': n.estado === 'PUBLICADA',
                'status-archivada': n.estado === 'ARCHIVADA'
              }">
          {{n.estado}}
        </span>
      </div>
      <p *ngIf="n.resumen" style="color: #666; margin: 0.5rem 0;">{{n.resumen}}</p>
      <div style="display: flex; gap: 1rem; margin: 0.5rem 0; color: #666; font-size: 0.9rem;">
        <span *ngIf="n.fechaPublicacion">
          <b>Publicación:</b> {{formatDate(n.fechaPublicacion)}}
        </span>
        <span *ngIf="n.facultad">
          <b>Facultad:</b> {{n.facultad}}
        </span>
        <span *ngIf="n.programa">
          <b>Programa:</b> {{n.programa}}
        </span>
      </div>
      <div class="news-actions">
        <a class="btn" [routerLink]="['/admin/news', n.id]">Editar</a>
        <button class="btn" (click)="publish(n.id)" *ngIf="n.estado === 'BORRADOR' || n.estado === 'PROGRAMADA' || n.estado === 'ARCHIVADA'" 
                style="background: #4caf50;">
          Publicar
        </button>
        <button class="btn" (click)="archive(n.id)" *ngIf="n.estado === 'PUBLICADA' || n.estado === 'PROGRAMADA'" 
                style="background:#666">
          Archivar
        </button>
        <button class="btn" (click)="remove(n.id)" style="background:#b00020">Eliminar</button>
      </div>
    </div>
    <div class="pagination">
      <button class="btn" (click)="prev()" [disabled]="page===0 || loading">Anterior</button>
      <span>Página {{page + 1}} de {{totalPages}} (Total: {{total}})</span>
      <button class="btn" (click)="next()" [disabled]="(page+1)*size>=total || loading">Siguiente</button>
    </div>
  </div>`,
  styles: [`
    .news-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .news-header h3 {
      margin: 0;
      flex: 1;
    }
    .news-status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: bold;
      text-transform: uppercase;
    }
    .status-borrador {
      background: #e0e0e0;
      color: #424242;
    }
    .status-programada {
      background: #2196F3;
      color: white;
    }
    .status-publicada {
      background: #4caf50;
      color: white;
    }
    .status-archivada {
      background: #666;
      color: white;
    }
    .news-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 1rem;
    }
  `]
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
  get totalPages(): number {
    return Math.ceil(this.total / this.size);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  prev(){ if(this.page>0 && !this.loading){ this.page--; this.load();}}
  next(){ if((this.page+1)*this.size<this.total && !this.loading){ this.page++; this.load();}}
  
  publish(id:string){ 
    if(!confirm('¿Publicar esta noticia? Se hará visible inmediatamente para los egresados.')) return; 
    this.api.post(`/admin/news/${id}/publish`,{}).subscribe({
      next: ()=>{ 
        this.toasts.success('Noticia publicada'); 
        this.load();
      },
      error: (err: any)=> {
        const msg = err.error?.error || 'Error al publicar';
        this.toasts.error(msg);
      }
    }); 
  }
  
  archive(id:string){ 
    if(!confirm('¿Archivar esta noticia? Ya no será visible para los egresados.')) return; 
    this.api.post(`/admin/news/${id}/archive`,{}).subscribe({
      next: ()=>{ 
        this.toasts.success('Noticia archivada'); 
        this.load();
      },
      error: (err: any)=> {
        const msg = err.error?.error || 'Error al archivar';
        this.toasts.error(msg);
      }
    }); 
  }
  
  remove(id:string){ 
    if(!confirm('¿Eliminar definitivamente esta noticia? Esta acción no se puede deshacer.')) return; 
    this.api.delete(`/admin/news/${id}`).subscribe({
      next: ()=>{ 
        this.toasts.success('Noticia eliminada'); 
        this.load();
      },
      error: (err: any)=> {
        const msg = err.error?.error || 'Error al eliminar';
        this.toasts.error(msg);
      }
    }); 
  }
}
