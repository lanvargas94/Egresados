import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CatalogService } from '../services/catalog.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-jobs-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <div class="container">
    <h2>Ofertas de Empleo</h2>
    
    <form [formGroup]="f" (ngSubmit)="load()" class="card">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
        <div>
          <label>Estado</label>
          <select formControlName="estado">
            <option value="">(Todos)</option>
            <option value="PUBLICADA">PUBLICADA</option>
            <option value="VENCIDA">VENCIDA</option>
            <option value="ARCHIVADA">ARCHIVADA</option>
          </select>
        </div>
        
        <div>
          <label>Buscar (título/empresa)</label>
          <input formControlName="search" placeholder="Buscar..." />
        </div>
        
        <div>
          <label>Sector</label>
          <select formControlName="sector">
            <option value="">(Todos)</option>
            <option *ngFor="let s of sectors" [value]="s">{{s}}</option>
          </select>
        </div>
        
        <div>
          <label>Tipo contrato</label>
          <select formControlName="tipoContrato">
            <option value="">(Todos)</option>
            <option *ngFor="let t of contractTypes" [value]="t">{{t}}</option>
          </select>
        </div>
      </div>
      
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn" type="submit" [disabled]="loading">Filtrar</button>
        <button class="btn" type="button" (click)="reset()" style="background: #666;">Limpiar</button>
      </div>
    </form>

    <div *ngIf="loading" class="card" style="text-align: center; padding: 2rem;">
      <p>Cargando ofertas...</p>
    </div>

    <div *ngIf="items.length === 0 && !loading" class="card" style="text-align: center; padding: 2rem;">
      <p>No hay ofertas de empleo disponibles para el estado seleccionado.</p>
    </div>

    <div class="job-card" *ngFor="let j of items" [routerLink]="['/jobs', j.id]">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
        <div style="flex: 1;">
          <h3 style="margin: 0 0 0.5rem 0; color: #1976d2;">{{j.titulo}}</h3>
          <p style="margin: 0.25rem 0; color: #666;">
            <strong>Empresa:</strong> {{j.empresa || 'N/A'}} | 
            <strong>Ciudad:</strong> {{j.ciudad || 'N/A'}}
          </p>
          <p style="margin: 0.25rem 0; color: #666;">
            <strong>Tipo de contrato:</strong> {{j.tipoContrato || 'N/A'}} | 
            <strong>Modalidad:</strong> {{j.modalidad || 'N/A'}}
          </p>
          <p style="margin: 0.25rem 0; color: #666; font-size: 0.9rem;">
            <strong>Publicación:</strong> {{formatDate(j.fechaInicioPublicacion)}}
            <span *ngIf="j.fechaFinPublicacion">
              - <strong>Vence:</strong> {{formatDate(j.fechaFinPublicacion)}}
            </span>
          </p>
        </div>
        <span [class]="'badge badge-' + getEstadoClass(j.estado)" style="margin-left: 1rem;">
          {{j.estado}}
        </span>
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
    .job-card {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .job-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }
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
export class JobsListComponent implements OnInit {
  items: any[] = []; 
  total=0; 
  page=0; 
  size=10; 
  loading = false;
  sectors:string[]=[]; 
  contractTypes:string[]=[];
  
  f=this.fb.group({
    estado:[''],
    search:[''],
    sector:[''],
    empresa:[''],
    tipoContrato:['']
  });
  
  constructor(
    private api: ApiService, 
    private fb: FormBuilder, 
    private catalog: CatalogService,
    private toast: ToastService
  ) {}
  
  ngOnInit() { 
    this.catalog.sectors().subscribe({
      next: (res:any) => this.sectors = res.items || res || []
    }); 
    this.catalog.contractTypes().subscribe({
      next: (res:any) => this.contractTypes = res.items || res || []
    }); 
    this.load(); 
  }
  
  get totalPages(): number {
    return Math.ceil(this.total / this.size);
  }
  
  load(){ 
    this.loading = true;
    const v=this.f.value;
    const params = new URLSearchParams();
    if (v.estado) params.append('estado', v.estado);
    if (v.search) params.append('search', v.search);
    if (v.sector) params.append('sector', v.sector);
    if (v.empresa) params.append('empresa', v.empresa);
    if (v.tipoContrato) params.append('tipoContrato', v.tipoContrato);
    params.append('page', this.page.toString());
    params.append('size', this.size.toString());
    params.append('sort', 'desc');
    
    this.api.get(`/jobs?${params.toString()}`).subscribe({
      next: (res:any) => { 
        this.items = res.items || []; 
        this.total = res.total || 0; 
        this.loading = false;
      },
      error: (err) => {
        this.toast.error('Error al cargar ofertas');
        this.loading = false;
      }
    }); 
  }
  
  reset() {
    this.f.reset();
    this.page = 0;
    this.load();
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
  
  getEstadoClass(estado: string): string {
    return estado || 'PUBLICADA';
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
