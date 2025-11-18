import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CatalogService } from '../services/catalog.service';

@Component({
  selector: 'app-jobs-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="container">
    <h2>Empleos</h2>
    <form [formGroup]="f" (ngSubmit)="load()" class="card">
      <label>Sector</label>
      <select formControlName="sector">
        <option value="">(Todos)</option>
        <option *ngFor="let s of sectors" [value]="s">{{s}}</option>
      </select>
      <label>Empresa</label>
      <input formControlName="empresa" />
      <label>Tipo contrato</label>
      <select formControlName="tipoContrato">
        <option value="">(Todos)</option>
        <option *ngFor="let t of contractTypes" [value]="t">{{t}}</option>
      </select>
      <label>Desde</label>
      <input type="date" formControlName="fromDate" />
      <label>Hasta</label>
      <input type="date" formControlName="toDate" />
      <label>Orden</label>
      <select formControlName="sort"><option value="asc">Asc</option><option value="desc">Desc</option></select>
      <button class="btn" type="submit">Filtrar</button>
    </form>
    <div class="card" *ngFor="let j of items">
      <h3>{{j.titulo}}</h3>
      <p>{{j.empresa}} — {{j.sector}} — {{j.tipoContrato}}</p>
      <p>Fecha cierre: {{j.fechaCierre}}</p>
      <a *ngIf="j.enlacePostulacion && j.enlacePostulacion.startsWith('http')" [href]="j.enlacePostulacion" target="_blank" class="btn">Postular</a>
      <a *ngIf="j.enlacePostulacion && !j.enlacePostulacion.startsWith('http')" [href]="'mailto:'+j.enlacePostulacion" class="btn">Postular</a>
    </div>
    <button class="btn" (click)="prev()" [disabled]="page===0">Prev</button>
    <button class="btn" (click)="next()" [disabled]="(page+1)*size>=total">Next</button>
  </div>`
})
export class JobsListComponent implements OnInit {
  items: any[] = []; total=0; page=0; size=10; f=this.fb.group({sector:[''],empresa:[''],tipoContrato:[''],fromDate:[''],toDate:[''],sort:['asc']});
  sectors:string[]=[]; contractTypes:string[]=[];
  constructor(private api: ApiService, private fb: FormBuilder, private catalog: CatalogService) {}
  ngOnInit() { this.catalog.sectors().subscribe((res:any)=>this.sectors=res); this.catalog.contractTypes().subscribe((res:any)=>this.contractTypes=res); this.load(); }
  load(){ const v=this.f.value;
    const q=`sector=${encodeURIComponent(v.sector||'')}&empresa=${encodeURIComponent(v.empresa||'')}&tipoContrato=${encodeURIComponent(v.tipoContrato||'')}`+
      `&fromDate=${v.fromDate||''}&toDate=${v.toDate||''}&page=${this.page}&size=${this.size}&sort=${v.sort}`;
    this.api.get(`/jobs?${q}`).subscribe((res:any)=>{ this.items = res.items; this.total = res.total; }); }
  prev(){ if(this.page>0){ this.page--; this.load(); } }
  next(){ if((this.page+1)*this.size<this.total){ this.page++; this.load(); } }
}
