import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { CatalogService } from '../services/catalog.service';

@Component({
  selector: 'app-admin-jobs-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <div class="container">
    <div class="card">
      <h2>{{id? 'Editar' : 'Crear'}} Oferta de Empleo</h2>
      <form [formGroup]="f" (ngSubmit)="save()">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label>Título <span style="color: red;">*</span></label>
            <input formControlName="titulo" [class.error]="f.get('titulo')?.invalid && f.get('titulo')?.touched" />
            <small *ngIf="f.get('titulo')?.invalid && f.get('titulo')?.touched" style="color: red;">
              El título es obligatorio
            </small>
          </div>
          
          <div>
            <label>Empresa <span style="color: red;">*</span></label>
            <input formControlName="empresa" [class.error]="f.get('empresa')?.invalid && f.get('empresa')?.touched" />
            <small *ngIf="f.get('empresa')?.invalid && f.get('empresa')?.touched" style="color: red;">
              La empresa es obligatoria
            </small>
          </div>
        </div>

        <div>
          <label>Descripción <span style="color: red;">*</span></label>
          <textarea formControlName="descripcion" rows="6" style="width:100%" 
                    [class.error]="f.get('descripcion')?.invalid && f.get('descripcion')?.touched"></textarea>
          <small *ngIf="f.get('descripcion')?.invalid && f.get('descripcion')?.touched" style="color: red;">
            La descripción es obligatoria
          </small>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label>Ciudad / Ubicación <span style="color: red;">*</span></label>
            <input formControlName="ciudad" [class.error]="f.get('ciudad')?.invalid && f.get('ciudad')?.touched" />
            <small *ngIf="f.get('ciudad')?.invalid && f.get('ciudad')?.touched" style="color: red;">
              La ciudad es obligatoria
            </small>
          </div>

          <div>
            <label>Modalidad <span style="color: red;">*</span></label>
            <select formControlName="modalidad" [class.error]="f.get('modalidad')?.invalid && f.get('modalidad')?.touched">
              <option value="">Seleccione...</option>
              <option value="PRESENCIAL">Presencial</option>
              <option value="REMOTO">Remoto</option>
              <option value="HIBRIDO">Híbrido</option>
            </select>
            <small *ngIf="f.get('modalidad')?.invalid && f.get('modalidad')?.touched" style="color: red;">
              La modalidad es obligatoria
            </small>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label>Tipo de Contrato <span style="color: red;">*</span></label>
            <select formControlName="tipoContrato" [class.error]="f.get('tipoContrato')?.invalid && f.get('tipoContrato')?.touched">
              <option value="">Seleccione...</option>
              <option *ngFor="let t of contractTypes" [value]="t">{{t}}</option>
            </select>
            <small *ngIf="f.get('tipoContrato')?.invalid && f.get('tipoContrato')?.touched" style="color: red;">
              El tipo de contrato es obligatorio
            </small>
          </div>

          <div>
            <label>Sector</label>
            <select formControlName="sector">
              <option value="">Seleccione...</option>
              <option *ngFor="let s of sectors" [value]="s">{{s}}</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label>Fecha Inicio Publicación <span style="color: red;">*</span></label>
            <input type="datetime-local" formControlName="fechaInicioPublicacion" 
                   [class.error]="f.get('fechaInicioPublicacion')?.invalid && f.get('fechaInicioPublicacion')?.touched" />
            <small *ngIf="f.get('fechaInicioPublicacion')?.invalid && f.get('fechaInicioPublicacion')?.touched" style="color: red;">
              La fecha de inicio es obligatoria
            </small>
          </div>

          <div>
            <label>Fecha Fin Publicación <span style="color: red;">*</span></label>
            <input type="datetime-local" formControlName="fechaFinPublicacion" 
                   [class.error]="f.get('fechaFinPublicacion')?.invalid && f.get('fechaFinPublicacion')?.touched" />
            <small *ngIf="f.get('fechaFinPublicacion')?.invalid && f.get('fechaFinPublicacion')?.touched" style="color: red;">
              La fecha de fin es obligatoria
            </small>
          </div>
        </div>

        <div>
          <label>Rango Salarial</label>
          <input formControlName="rangoSalarial" placeholder="Ej: $2.000.000 - $3.000.000" />
        </div>

        <div style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
          <small style="color: #666;">
            <span style="color: red;">*</span> Campos obligatorios
          </small>
        </div>

        <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
          <button class="btn" type="submit" [disabled]="f.invalid || saving">
            {{saving ? 'Guardando...' : 'Guardar'}}
          </button>
          <button class="btn" type="button" (click)="publish()" [disabled]="!id || f.invalid || saving" 
                  style="background: #4caf50;">
            Publicar
          </button>
          <a class="btn" routerLink="/admin/jobs" style="background: #666; text-decoration: none;">
            Cancelar
          </a>
        </div>
      </form>
    </div>
  </div>
  `,
  styles: [`
    .error {
      border-color: red !important;
    }
    input[type="datetime-local"] {
      padding: 0.5rem;
    }
  `]
})
export class AdminJobsFormComponent implements OnInit {
  id: string | null = null; 
  saving=false; 
  sectors:string[]=[]; 
  contractTypes:string[]=[];
  
  f = this.fb.group({
    titulo: ['', Validators.required], 
    empresa: ['', Validators.required], 
    descripcion: ['', Validators.required],
    ciudad: ['', Validators.required],
    modalidad: ['', Validators.required],
    tipoContrato: ['', Validators.required],
    sector: [''], 
    fechaInicioPublicacion: ['', Validators.required],
    fechaFinPublicacion: ['', Validators.required],
    rangoSalarial: ['']
  });
  
  constructor(
    private fb: FormBuilder, 
    private api: ApiService, 
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService, 
    private catalog: CatalogService
  ) {}
  
  ngOnInit(){ 
    this.id = this.route.snapshot.paramMap.get('id'); 
    this.catalog.sectors().subscribe({
      next: (res:any) => this.sectors = res.items || res || []
    }); 
    this.catalog.contractTypes().subscribe({
      next: (res:any) => this.contractTypes = res.items || res || []
    }); 
    
    if(this.id){ 
      this.api.get(`/admin/jobs/${this.id}`).subscribe({
        next: (j:any) => { 
          // Convertir fechas de ISO a formato datetime-local
          if (j.fechaInicioPublicacion) {
            j.fechaInicioPublicacion = this.toLocalDateTime(j.fechaInicioPublicacion);
          }
          if (j.fechaFinPublicacion) {
            j.fechaFinPublicacion = this.toLocalDateTime(j.fechaFinPublicacion);
          }
          this.f.patchValue(j); 
        },
        error: () => {
          this.toast.error('Error al cargar la oferta');
          this.router.navigate(['/admin/jobs']);
        }
      }); 
    } 
  }
  
  toLocalDateTime(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  
  toISOString(localDateTime: string): string {
    if (!localDateTime) return '';
    return new Date(localDateTime).toISOString();
  }
  
  save(){ 
    this.saving=true; 
    const body = {...this.f.value};
    
    // Convertir fechas a ISO
    if (body.fechaInicioPublicacion) {
      body.fechaInicioPublicacion = this.toISOString(body.fechaInicioPublicacion);
    }
    if (body.fechaFinPublicacion) {
      body.fechaFinPublicacion = this.toISOString(body.fechaFinPublicacion);
    }
    
    const req = this.id? 
      this.api.put(`/admin/jobs/${this.id}`, body): 
      this.api.post('/admin/jobs', body); 
      
    req.subscribe({ 
      next: (res:any) => { 
        this.saving=false; 
        this.toast.success('Guardado correctamente'); 
        if(!this.id){ 
          this.id=res.id; 
          this.router.navigate([`/admin/jobs/${res.id}`]);
        } 
      }, 
      error: (err: any) => { 
        this.saving=false; 
        const msg = err.error?.error || 'Error al guardar';
        this.toast.error(msg); 
      } 
    }); 
  }
  
  publish(){ 
    if(!this.id) return; 
    
    // Validar campos obligatorios para publicar
    const v=this.f.value; 
    const camposFaltantes: string[] = [];
    
    if(!v.titulo) camposFaltantes.push('Título');
    if(!v.empresa) camposFaltantes.push('Empresa');
    if(!v.descripcion) camposFaltantes.push('Descripción');
    if(!v.ciudad) camposFaltantes.push('Ciudad');
    if(!v.tipoContrato) camposFaltantes.push('Tipo de contrato');
    if(!v.modalidad) camposFaltantes.push('Modalidad');
    if(!v.fechaInicioPublicacion) camposFaltantes.push('Fecha inicio publicación');
    if(!v.fechaFinPublicacion) camposFaltantes.push('Fecha fin publicación');
    
    if(camposFaltantes.length > 0){
      this.toast.error(`Faltan campos obligatorios: ${camposFaltantes.join(', ')}`);
      return; 
    }
    
    this.api.post(`/admin/jobs/${this.id}/publish`,{}).subscribe({ 
      next: () => {
        this.toast.success('Oferta publicada correctamente');
        this.router.navigate(['/admin/jobs']);
      },
      error: (err: any) => {
        const msg = err.error?.error || 'Error al publicar';
        this.toast.error(msg); 
      } 
    }); 
  }
}
