import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-admin-export-history',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="container">
    <h2>Historial de Exportaciones</h2>
    <table class="card" style="width:100%">
      <thead><tr><th>Fecha</th><th>Usuario</th><th>Formato</th><th>Cantidad</th><th>Campos</th><th>Filtros</th></tr></thead>
      <tbody>
        <tr *ngFor="let r of items">
          <td>{{r.createdAt}}</td>
          <td>{{r.actor}}</td>
          <td>{{r.format}}</td>
          <td>{{r.count}}</td>
          <td>{{r.fields}}</td>
          <td>{{r.filters}}</td>
        </tr>
      </tbody>
    </table>
    
    <div *ngIf="items.length === 0 && !loading" class="card" style="text-align: center; padding: 2rem;">
      <p>Sin resultados</p>
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
export class AdminExportHistoryComponent implements OnInit {
  items:any[]=[]; total=0; page=0; size=10; loading=false;
  constructor(private api: ApiService) {}
  ngOnInit(){ this.load(); }
  
  get totalPages(): number {
    return Math.ceil(this.total / this.size);
  }
  
  load(){ 
    this.loading = true;
    this.api.get(`/admin/reports/logs?page=${this.page}&size=${this.size}`).subscribe({
      next: (res:any) => { 
        this.items=res.items || []; 
        this.total=res.total || 0; 
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    }); 
  }
  prev(){ if(this.page>0 && !this.loading){ this.page--; this.load(); } }
  next(){ if((this.page+1)*this.size<this.total && !this.loading){ this.page++; this.load(); } }
}

