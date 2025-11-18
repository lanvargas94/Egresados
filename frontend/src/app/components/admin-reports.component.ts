import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="container">
    <h2>Exportar Reportes</h2>
    <form [formGroup]="f" (ngSubmit)="export()" class="card">
      <label>Campos</label>
      <div>
        <label *ngFor="let c of allFields" style="margin-right:8px"><input type="checkbox" [value]="c" (change)="toggleField($event)"/> {{c}}</label>
      </div>
      <h3>Filtros</h3>
      <label>Facultad</label><input formControlName="facultad" />
      <label>Programa</label><input formControlName="programa" />
      <label>Año</label><input type="number" formControlName="anio" />
      <label>País</label><input formControlName="pais" />
      <label>Ciudad</label><input formControlName="ciudad" />
      <label>Sector</label><input formControlName="sector" />
      <label>Situación</label><input formControlName="situacion" />
      <label>Actualizado desde</label><input type="datetime-local" formControlName="updatedFrom" />
      <label>Actualizado hasta</label><input type="datetime-local" formControlName="updatedTo" />
      <label>Formato</label>
      <select formControlName="format"><option value="csv">CSV</option><option value="xlsx">Excel (XLSX)</option></select>
      <label>Justificación (si exportas > 5000 sin filtros)</label>
      <input formControlName="justification" />
      <button class="btn" type="submit">Exportar CSV</button>
    </form>
  </div>
  `
})
export class AdminReportsComponent {
  allFields = ['identificacion','nombre','correo','pais','ciudad','telefono','situacion','industria','empresa','cargo','consentimiento','onboarding','actualizado','facultad','programa','anio'];
  selectedFields: string[] = ['identificacion','nombre','correo'];
  f = this.fb.group({ facultad:[''], programa:[''], anio:[null], pais:[''], ciudad:[''], sector:[''], situacion:[''], updatedFrom:[''], updatedTo:[''], justification:[''], format:['csv']});
  constructor(private fb: FormBuilder, private api: ApiService) {}
  toggleField(ev:any){ const val = ev.target.value; if(ev.target.checked){ if(!this.selectedFields.includes(val)) this.selectedFields.push(val);} else { this.selectedFields = this.selectedFields.filter(f=>f!==val);} }
  export(){ const v=this.f.value as any; const fmt = v.format || 'csv'; const body:any = { fields:this.selectedFields, facultad:v.facultad||null, programa:v.programa||null, anio:v.anio||null, pais:v.pais||null, ciudad:v.ciudad||null, sector:v.sector||null, situacion:v.situacion||null, updatedFrom: v.updatedFrom? new Date(v.updatedFrom as string).toISOString(): null, updatedTo: v.updatedTo? new Date(v.updatedTo as string).toISOString(): null, justification: v.justification||null, format: fmt };
    const opts:any = { observe: 'response' as any };
    if (fmt === 'csv') { opts.responseType = 'text' as any; } else { opts.responseType = 'blob' as any; }
    this.api.post('/admin/reports/export', body, opts).subscribe((res:any)=>{
      const isCsv = fmt==='csv';
      const blob = isCsv ? new Blob([res.body], { type: 'text/csv;charset=utf-8;' }) : res.body;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = isCsv ? 'export-egresados.csv' : 'export-egresados.xlsx'; a.click(); window.URL.revokeObjectURL(url);
    });
  }
}
