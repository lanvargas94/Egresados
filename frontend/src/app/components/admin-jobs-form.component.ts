import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { CatalogService } from '../services/catalog.service';

@Component({
  selector: 'app-admin-jobs-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <div class="container"><div class="card">
    <h2>{{id? 'Editar' : 'Crear'}} Empleo</h2>
    <form [formGroup]="f" (ngSubmit)="save()">
      <label>Título</label>
      <input formControlName="titulo" />
      <label>Empresa</label>
      <input formControlName="empresa" />
      <label>Sector</label>
      <select formControlName="sector">
        <option value="">Seleccione...</option>
        <option *ngFor="let s of sectors" [value]="s">{{s}}</option>
      </select>
      <label>Fecha cierre</label>
      <input type="date" formControlName="fechaCierre" />
      <label>Tipo de contrato</label>
      <select formControlName="tipoContrato">
        <option value="">Seleccione...</option>
        <option *ngFor="let t of contractTypes" [value]="t">{{t}}</option>
      </select>
      <label>Enlace de postulación (URL o email)</label>
      <input formControlName="enlacePostulacion" />
      <label>Resumen</label>
      <textarea formControlName="resumen" rows="4" style="width:100%"></textarea>
      <div style="margin-top:8px">
        <button class="btn" type="submit" [disabled]="f.invalid || saving">Guardar</button>
        <button class="btn" type="button" (click)="publish()" [disabled]="!id">Publicar</button>
      </div>
    </form>
  </div></div>
  `
})
export class AdminJobsFormComponent implements OnInit {
  id: string | null = null; saving=false; sectors:string[]=[]; contractTypes:string[]=[];
  f = this.fb.group({
    titulo: ['', Validators.required], empresa: ['', Validators.required], sector: [''], fechaCierre: ['', Validators.required], tipoContrato: [''], enlacePostulacion: ['', Validators.required], resumen: ['']
  });
  constructor(private fb: FormBuilder, private api: ApiService, private route: ActivatedRoute, private toast: ToastService, private catalog: CatalogService) {}
  ngOnInit(){ this.id = this.route.snapshot.paramMap.get('id'); this.catalog.sectors().subscribe((res:any)=>this.sectors=res); this.catalog.contractTypes().subscribe((res:any)=>this.contractTypes=res); if(this.id){ this.api.get(`/admin/jobs/${this.id}`).subscribe((j:any)=>{ this.f.patchValue(j); }); } }
  save(){ this.saving=true; const body=this.f.value; const req = this.id? this.api.put(`/admin/jobs/${this.id}`, body): this.api.post('/admin/jobs', body); req.subscribe({ next: (res:any)=>{ this.saving=false; this.toast.success('Guardado'); if(!this.id){ this.id=res.id; } }, error: ()=>{ this.saving=false; this.toast.error('Error'); } }); }
  publish(){ if(!this.id) return; const v=this.f.value; if(!v.titulo || !v.empresa || !v.sector || !v.fechaCierre || !v.enlacePostulacion){ this.toast.error('Faltan campos obligatorios para publicar (RN-AE01)'); return; } if(!this.isUrl(v.enlacePostulacion!) && !this.isEmail(v.enlacePostulacion!)){ this.toast.error('Enlace inválido (URL o email)'); return; } this.api.post(`/admin/jobs/${this.id}/publish`,{}).subscribe({ next: ()=> this.toast.success('Publicada'), error: ()=> this.toast.error('Error al publicar') }); }
  isEmail(s:string){ return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(s); }
  isUrl(s:string){ return /^https?:\/\//.test(s); }
}
