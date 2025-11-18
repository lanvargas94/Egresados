import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin-contract-types',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="container">
    <h2>Tipos de Contrato</h2>
    <form [formGroup]="f" (ngSubmit)="create()" class="card">
      <label>Nombre</label>
      <input formControlName="name" />
      <button class="btn" type="submit" [disabled]="f.invalid">Crear</button>
    </form>
    <div class="card" *ngFor="let t of items">
      <b>{{t.name}}</b> — {{t.active? 'Activo':'Inactivo'}}
      <div>
        <button class="btn" (click)="deactivate(t)" *ngIf="t.active">Desactivar</button>
      </div>
    </div>
  </div>
  `
})
export class AdminContractTypesComponent implements OnInit {
  items:any[]=[]; f=this.fb.group({ name:['', Validators.required] });
  constructor(private api: ApiService, private fb: FormBuilder, private toast: ToastService) {}
  ngOnInit(){ this.load(); }
  load(){ this.api.get('/admin/contract-types').subscribe((res:any)=> this.items=res); }
  create(){ const body={ name: this.f.value.name }; this.api.post('/admin/contract-types', body).subscribe({ next: ()=>{ this.toast.success('Creado'); this.f.reset(); this.load(); }, error: ()=> this.toast.error('Error') }); }
  deactivate(t:any){ if(!confirm('¿Desactivar tipo?')) return; this.api.post(`/admin/contract-types/${t.id}/deactivate`,{}).subscribe({ next: ()=>{ this.toast.success('Desactivado'); this.load(); }, error: ()=> this.toast.error('Error') }); }
}

