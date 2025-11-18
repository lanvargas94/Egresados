import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { CatalogService } from '../services/catalog.service';
import { ElementRef, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="container">
    <h2>Analítica</h2>
    <form [formGroup]="f" (ngSubmit)="loadAll()" class="card">
      <label>Facultad</label>
      <select formControlName="facultad" (change)="onFacultyChange($event.target.value)">
        <option value="">(Todas)</option>
        <option *ngFor="let fa of faculties" [value]="fa.name">{{fa.name}}</option>
      </select>
      <label>Programa</label>
      <select formControlName="programa">
        <option value="">(Todos)</option>
        <option *ngFor="let p of programs" [value]="p">{{p}}</option>
      </select>
      <label>Año</label><input type="number" formControlName="anio" />
      <label>Desde</label><input type="datetime-local" formControlName="from" />
      <label>Hasta</label><input type="datetime-local" formControlName="to" />
      <button class="btn" type="submit">Aplicar filtros</button>
      <button class="btn" type="button" (click)="exportXlsx()" style="margin-left:8px">Exportar XLSX</button>
    </form>
    <div class="card">
      <h3>Demografía</h3>
      <canvas #demoChart></canvas>
    </div>
    <div class="card">
      <h3>Empleabilidad (%)</h3>
      <canvas #empleoChart></canvas>
    </div>
    <div class="card">
      <h3>Adopción (últimos 12 meses por defecto)</h3>
      <canvas #adopcionChart></canvas>
    </div>
  </div>
  `
})
export class AdminAnalyticsComponent implements OnInit {
  f = this.fb.group({ facultad:[''], programa:[''], anio:[null], from:[''], to:['']});
  faculties:any[]=[]; programs:string[]=[];
  demografia:any[]=[]; empleabilidad:any=null; adopcion:any={updates:[],onboardings:[]};
  @ViewChild('demoChart') demoChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('empleoChart') empleoChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('adopcionChart') adopcionChartRef!: ElementRef<HTMLCanvasElement>;
  demoChart?: Chart; empleoChart?: Chart; adopcionChart?: Chart;
  constructor(private fb: FormBuilder, private api: ApiService, private catalog: CatalogService) {}
  ngOnInit(){ this.loadAll(); }
  loadAll(){ if(this.faculties.length===0){ this.catalog.faculties().subscribe((fs:any)=> this.faculties = fs); }
    const v=this.f.value; const base=`facultad=${encodeURIComponent(v.facultad||'')}&programa=${encodeURIComponent(v.programa||'')}&anio=${v.anio||''}`;
    this.api.get(`/admin/analytics/demografia?${base}`).subscribe((res:any)=>{ this.demografia=res; this.updateDemoChart(); });
    this.api.get(`/admin/analytics/empleabilidad?${base}`).subscribe((res:any)=>{ this.empleabilidad=res; this.updateEmpleoChart(); });
    const q=`from=${v.from||''}&to=${v.to||''}`; this.api.get(`/admin/analytics/adopcion?${q}`).subscribe((res:any)=>{ this.adopcion=res; this.updateAdopcionChart(); });
  }
  onFacultyChange(faculty:string){ this.programs=[]; this.f.patchValue({programa:''}); if(faculty){ this.catalog.programs(faculty).subscribe((ps:any)=> this.programs = ps); } }
  statusKeys(){ return this.empleabilidad? Object.keys(this.empleabilidad.porcentajes||{}): []; }
  updateDemoChart(){ const labels = this.demografia.map((r:any)=> `${r.programa||r.facultad||''} ${r.anio||''}`); const data = this.demografia.map((r:any)=> r.total||0);
    const cfg:any = { type:'bar', data: { labels, datasets: [{ label:'Egresados', data, backgroundColor:'#005bbb' }] }, options: { responsive:true, maintainAspectRatio:false } };
    if (this.demoChart) { this.demoChart.data.labels = labels; (this.demoChart.data.datasets[0].data as number[]) = data; this.demoChart.update(); }
    else if (this.demoChartRef) { this.demoChart = new Chart(this.demoChartRef.nativeElement.getContext('2d')!, cfg); }
  }
  updateEmpleoChart(){ const labels = this.statusKeys(); const data = labels.map((k:string)=> this.empleabilidad.porcentajes[k]||0);
    const cfg:any = { type:'bar', data: { labels, datasets: [{ label:'%', data, backgroundColor:'#2a6f2a' }] }, options: { responsive:true, maintainAspectRatio:false } };
    if (this.empleoChart) { this.empleoChart.data.labels = labels; (this.empleoChart.data.datasets[0].data as number[]) = data; this.empleoChart.update(); }
    else if (this.empleoChartRef) { this.empleoChart = new Chart(this.empleoChartRef.nativeElement.getContext('2d')!, cfg); }
  }
  updateAdopcionChart(){ const labels = (this.adopcion.updates||[]).map((u:any)=> (u.mes||'').substring(0,7)); const upd = (this.adopcion.updates||[]).map((u:any)=> u.updates||0); const onb = (this.adopcion.onboardings||[]).map((o:any)=> o.onboardings||0);
    const cfg:any = { type:'line', data: { labels, datasets: [ { label:'Actualizaciones', data: upd, borderColor:'#2a6f2a', backgroundColor:'rgba(42,111,42,0.2)', fill:true }, { label:'Onboardings', data: onb, borderColor:'#b07a00', backgroundColor:'rgba(176,122,0,0.2)', fill:true } ] }, options: { responsive:true, maintainAspectRatio:false } };
    if (this.adopcionChart) { this.adopcionChart.data.labels = labels; this.adopcionChart.data.datasets[0].data = upd as any; this.adopcionChart.data.datasets[1].data = onb as any; this.adopcionChart.update(); }
    else if (this.adopcionChartRef) { this.adopcionChart = new Chart(this.adopcionChartRef.nativeElement.getContext('2d')!, cfg); }
  }
  async exportXlsx(){ const XLSX = await import('xlsx'); const wb = XLSX.utils.book_new();
    const demRows = this.demografia.map((r:any)=> ({ facultad: r.facultad||'', programa: r.programa||'', anio: r.anio||'', total: r.total||0 }));
    const empRows = this.statusKeys().map((k:string)=> ({ situacion: k, porcentaje: this.empleabilidad.porcentajes[k] }));
    const updRows = (this.adopcion.updates||[]).map((u:any)=> ({ mes: u.mes, updates: u.updates }));
    const onbRows = (this.adopcion.onboardings||[]).map((o:any)=> ({ mes: o.mes, onboardings: o.onboardings }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(demRows), 'Demografia');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(empRows), 'Empleabilidad');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(updRows), 'Updates');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(onbRows), 'Onboardings');
    XLSX.writeFile(wb, 'analytics.xlsx');
  }
}
