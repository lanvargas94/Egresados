import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-jobs-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <div class="container">
    <h2>Ofertas de Empleo (Admin)</h2>
    <form [formGroup]="f" (ngSubmit)="load()" class="card">
      <label>Estado</label>
      <select formControlName="estado">
        <option value="">(Todos)</option>
        <option value="BORRADOR">BORRADOR</option>
        <option value="PUBLICADA">PUBLICADA</option>
        <option value="VENCIDA">VENCIDA</option>
        <option value="ARCHIVADA">ARCHIVADA</option>
      </select>
      <button class="btn" type="submit">Filtrar</button>
      <a class="btn" routerLink="/admin/jobs/new" style="margin-left:8px">Nuevo</a>
    </form>
    
    <div *ngIf="items.length === 0 && !loading" class="card" style="text-align: center; padding: 2rem;">
      <p>No hay ofertas de empleo disponibles para el estado seleccionado.</p>
    </div>

    <div *ngIf="loading" class="card" style="text-align: center; padding: 2rem;">
      <p>Cargando...</p>
    </div>

    <div class="card" *ngFor="let j of items" style="margin-bottom: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
        <div style="flex: 1;">
          <h3 style="margin: 0 0 0.5rem 0;">{{j.titulo}}</h3>
          <p style="margin: 0.25rem 0; color: #666;">
            <strong>Empresa:</strong> {{j.empresa || 'N/A'}} | 
            <strong>Ciudad:</strong> {{j.ciudad || 'N/A'}} | 
            <strong>Modalidad:</strong> {{j.modalidad || 'N/A'}}
          </p>
          <p style="margin: 0.25rem 0; color: #666; font-size: 0.9rem;">
            <strong>Publicación:</strong> {{formatDate(j.fechaInicioPublicacion)}} - 
            <strong>Vence:</strong> {{formatDate(j.fechaFinPublicacion) || 'Sin fecha'}}
          </p>
          <p style="margin: 0.25rem 0; color: #666; font-size: 0.9rem;" *ngIf="j.interesados !== undefined">
            <strong>Interesados:</strong> {{j.interesados}}
          </p>
        </div>
        <span [class]="'badge badge-' + getEstadoClass(j.estado)" style="margin-left: 1rem;">
          {{j.estado}}
        </span>
      </div>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
        <a class="btn" [routerLink]="['/admin/jobs', j.id]">Editar</a>
        <button class="btn" *ngIf="j.estado === 'BORRADOR'" (click)="publish(j.id)">Publicar</button>
        <button class="btn" *ngIf="j.estado === 'PUBLICADA'" (click)="expire(j.id)" style="background:#ff9800">Marcar como Vencida</button>
        <button class="btn" (click)="delete(j.id)" style="background:#b00020">Eliminar</button>
        <button class="btn" (click)="downloadReport(j.id)" style="background: #4caf50; display: inline-flex; align-items: center; gap: 0.5rem;" title="Descargar reporte de interesados">
          <span>📥</span>
          <span>Descargar reporte</span>
        </button>
      </div>
    </div>
    
    <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem;">
      <button class="btn" (click)="prev()" [disabled]="page===0 || loading">Anterior</button>
      <span style="padding: 0.5rem 1rem; display: inline-block;">
        Página {{page + 1}} de {{totalPages}} ({{total}} total)
      </span>
      <button class="btn" (click)="next()" [disabled]="(page+1)*size>=total || loading">Siguiente</button>
    </div>
  </div>
  `,
  styles: [`
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-BORRADOR {
      background-color: #9e9e9e;
      color: white;
    }
    .badge-PUBLICADA {
      background-color: #4caf50;
      color: white;
    }
    .badge-VENCIDA {
      background-color: #ff9800;
      color: white;
    }
    .badge-ARCHIVADA {
      background-color: #666;
      color: white;
    }
  `]
})
export class AdminJobsListComponent implements OnInit {
  items:any[]=[]; 
  total=0; 
  page=0; 
  size=10; 
  loading = false;
  f=this.fb.group({estado:['']});
  
  constructor(
    private api: ApiService, 
    private fb: FormBuilder, 
    private toasts: ToastService,
    private http: HttpClient
  ) {}
  
  ngOnInit(){ 
    this.load(); 
  }
  
  get totalPages(): number {
    return Math.ceil(this.total / this.size);
  }
  
  load(){ 
    this.loading = true;
    const estado=this.f.value.estado||''; 
    this.api.get(`/admin/jobs?page=${this.page}&size=${this.size}${estado?`&estado=${estado}`:''}`).subscribe({
      next: (res:any) => { 
        this.items=res.items || []; 
        this.total=res.total || 0;
        this.loading = false;
        // Cargar estadísticas de interesados para cada oferta
        this.items.forEach((j: any) => {
          this.loadStats(j.id).then((stats: any) => {
            j.interesados = stats.interesados || 0;
          });
        });
      },
      error: (err) => {
        this.toasts.error('Error al cargar ofertas');
        this.loading = false;
      }
    });
  }
  
  loadStats(jobId: string): Promise<any> {
    return new Promise((resolve) => {
      this.api.get(`/admin/jobs/${jobId}/stats`).subscribe({
        next: (res: any) => resolve(res),
        error: () => resolve({ interesados: 0 })
      });
    });
  }
  
  downloadReport(jobId: string) {
    const token = localStorage.getItem('adminToken');
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    this.http.get(`${environment.apiUrl}/admin/jobs/${jobId}/interests/export`, {
      responseType: 'blob',
      headers: headers
    }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `interesados-${jobId}.csv`;
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
  
  prev(){ 
    if(this.page>0){ 
      this.page--; 
      this.load(); 
    } 
  }
  
  next(){ 
    if((this.page+1)*this.size<this.total){ 
      this.page++; 
      this.load(); 
    } 
  }
  
  publish(id:string){ 
    if(!confirm('¿Publicar esta oferta?')) return; 
    this.api.post(`/admin/jobs/${id}/publish`,{}).subscribe({
      next: () => { 
        this.toasts.success('Oferta publicada'); 
        this.load(); 
      },
      error: (err: any) => {
        const msg = err.error?.error || 'Error al publicar';
        this.toasts.error(msg);
      }
    }); 
  }
  
  expire(id:string){ 
    if(!confirm('¿Marcar esta oferta como vencida?')) return; 
    this.api.post(`/admin/jobs/${id}/expire`,{}).subscribe({
      next: () => { 
        this.toasts.success('Oferta marcada como vencida'); 
        this.load(); 
      },
      error: (err: any) => {
        const msg = err.error?.error || 'Error al marcar como vencida';
        this.toasts.error(msg);
      }
    }); 
  }
  
  delete(id:string){ 
    if(!confirm('¿Estás seguro de eliminar esta oferta? Esta acción no se puede deshacer.')) return; 
    this.api.delete(`/admin/jobs/${id}`).subscribe({
      next: () => { 
        this.toasts.success('Oferta eliminada'); 
        this.load(); 
      },
      error: (err: any) => {
        const msg = err.error?.error || 'Error al eliminar';
        this.toasts.error(msg);
      }
    }); 
  }
  
  getEstadoClass(estado: string): string {
    return estado || 'BORRADOR';
  }
  
  formatDate(date: string | null): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return date;
    }
  }
}
