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
    <button class="btn" (click)="prev()" [disabled]="page===0">Prev</button>
    <button class="btn" (click)="next()" [disabled]="(page+1)*size>=total">Next</button>
  </div>
  `
})
export class AdminExportHistoryComponent implements OnInit {
  items:any[]=[]; total=0; page=0; size=10;
  constructor(private api: ApiService) {}
  ngOnInit(){ this.load(); }
  load(){ this.api.get(`/admin/reports/logs?page=${this.page}&size=${this.size}`).subscribe((res:any)=>{ this.items=res.items; this.total=res.total; }); }
  prev(){ if(this.page>0){ this.page--; this.load(); } }
  next(){ if((this.page+1)*this.size<this.total){ this.page++; this.load(); } }
}

