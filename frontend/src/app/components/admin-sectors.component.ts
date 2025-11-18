import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin-sectors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="container">
    <h2>Sectores</h2>
    <form [formGroup]="f" (ngSubmit)="create()" class="card">
      <label>Nombre</label>
      <input formControlName="name" />
      <button class="btn" type="submit" [disabled]="f.invalid">Crear</button>
    </form>
    <div class="card" *ngFor="let s of items">
      <b>{{s.name}}</b> — {{s.active? 'Activo':'Inactivo'}}
      <div>
        <button class="btn" (click)="deactivate(s)" *ngIf="s.active">Desactivar</button>
      </div>
    </div>
  </div>
  `
})
export class AdminSectorsComponent implements OnInit {
  items:any[]=[]; f=this.fb.group({ name:['', Validators.required] });
  constructor(private api: ApiService, private fb: FormBuilder, private toast: ToastService) {}
  ngOnInit(){ this.load(); }
  load(){ this.api.get('/admin/sectors').subscribe((res:any)=> this.items=res); }
  create(){ const body={ name: this.f.value.name }; this.api.post('/admin/sectors', body).subscribe({ next: ()=>{ this.toast.success('Creado'); this.f.reset(); this.load(); }, error: ()=> this.toast.error('Error') }); }
  deactivate(s:any){ if(!confirm('¿Desactivar sector?')) return; this.api.post(`/admin/sectors/${s.id}/deactivate`,{}).subscribe({ next: ()=>{ this.toast.success('Desactivado'); this.load(); }, error: ()=> this.toast.error('Error') }); }
}

