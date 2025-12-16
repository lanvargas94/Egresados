import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="container">
    <div class="card" *ngIf="job">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
        <h2 style="margin: 0;">{{job.titulo}}</h2>
        <span [class]="'badge badge-' + getEstadoClass(job.estado)">
          {{job.estado}}
        </span>
      </div>

      <div *ngIf="job.estado === 'VENCIDA'" class="warning-box" style="background: #fff3cd; border: 1px solid #ffc107; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
        <strong>⚠️ Esta oferta está vencida</strong>
      </div>

      <div *ngIf="job.estado === 'ARCHIVADA'" class="info-box" style="background: #e9ecef; border: 1px solid #6c757d; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
        <strong>ℹ️ Esta oferta está archivada (solo lectura)</strong>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div>
          <strong>Empresa:</strong>
          <p>{{job.empresa || 'N/A'}}</p>
        </div>
        <div>
          <strong>Ciudad:</strong>
          <p>{{job.ciudad || 'N/A'}}</p>
        </div>
        <div>
          <strong>Tipo de Contrato:</strong>
          <p>{{job.tipoContrato || 'N/A'}}</p>
        </div>
        <div>
          <strong>Modalidad:</strong>
          <p>{{job.modalidad || 'N/A'}}</p>
        </div>
        <div>
          <strong>Sector:</strong>
          <p>{{job.sector || 'N/A'}}</p>
        </div>
        <div>
          <strong>Rango Salarial:</strong>
          <p>{{job.rangoSalarial || 'No especificado'}}</p>
        </div>
        <div>
          <strong>Fecha de Publicación:</strong>
          <p>{{formatDate(job.fechaInicioPublicacion)}}</p>
        </div>
        <div>
          <strong>Fecha de Vencimiento:</strong>
          <p>{{formatDate(job.fechaFinPublicacion) || 'No especificada'}}</p>
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <strong>Descripción:</strong>
        <div [innerHTML]="job.descripcion || 'Sin descripción'" style="margin-top: 0.5rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;"></div>
      </div>

      <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
        <button *ngIf="job.estado === 'PUBLICADA'" class="btn" (click)="markInterested()" style="background: #4caf50;">
          Marcar como interesado
        </button>
        <a class="btn" routerLink="/jobs" style="background: #666; text-decoration: none;">
          Volver a ofertas
        </a>
      </div>
    </div>

    <div *ngIf="loading" class="card" style="text-align: center; padding: 2rem;">
      <p>Cargando oferta...</p>
    </div>

    <div *ngIf="error" class="card" style="text-align: center; padding: 2rem; background: #ffebee;">
      <p style="color: #c62828;">{{error}}</p>
      <a class="btn" routerLink="/jobs" style="margin-top: 1rem;">Volver a ofertas</a>
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
      white-space: nowrap;
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
      background-color: #9e9e9e;
      color: white;
    }
  `]
})
export class JobDetailComponent implements OnInit {
  job: any = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadJob(id);
    } else {
      this.error = 'ID de oferta no válido';
    }
  }

  loadJob(id: string) {
    this.loading = true;
    this.error = null;
    this.api.get(`/jobs/${id}`).subscribe({
      next: (res: any) => {
        this.job = res;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.error || 'Oferta no encontrada o no disponible';
        this.loading = false;
      }
    });
  }

  markInterested() {
    if (!this.job || this.job.estado !== 'PUBLICADA') return;
    
    this.api.post(`/jobs/${this.job.id}/interest`, {}).subscribe({
      next: () => {
        this.toast.success('Has marcado esta oferta como de tu interés');
      },
      error: (err: any) => {
        const msg = err.error?.error || 'Error al marcar interés';
        this.toast.error(msg);
      }
    });
  }

  getEstadoClass(estado: string): string {
    return estado || 'PUBLICADA';
  }

  formatDate(date: string | null): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return date;
    }
  }
}


