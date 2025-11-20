import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProfileService } from '../services/profile.service';
import { CatalogService } from '../services/catalog.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  styles: [`
    .profile-header {
      margin-bottom: var(--spacing-xl);
    }
    
    .profile-header h1 {
      color: var(--primary);
      margin-bottom: var(--spacing-sm);
    }
    
    .form-section {
      margin-bottom: var(--spacing-xl);
    }
    
    .form-section-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-lg);
      padding-bottom: var(--spacing-sm);
      border-bottom: 2px solid var(--border-color);
      color: var(--primary);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
    }
    
    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-md);
    }
    
    .checkbox-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-sm);
      margin-top: var(--spacing-md);
    }
    
    .checkbox-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm);
      border-radius: var(--border-radius-md);
      transition: background-color var(--transition-base);
    }
    
    .checkbox-item:hover {
      background-color: var(--gray-50);
    }
    
    .checkbox-item label {
      margin: 0;
      cursor: pointer;
      font-weight: var(--font-weight-normal);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex: 1;
    }
    
    .form-actions {
      display: flex;
      gap: var(--spacing-md);
      margin-top: var(--spacing-xl);
      padding-top: var(--spacing-lg);
      border-top: 2px solid var(--border-color);
    }
    
    .history-item {
      padding: var(--spacing-md);
      border-left: 3px solid var(--primary);
      margin-bottom: var(--spacing-sm);
      background: var(--gray-50);
      border-radius: var(--border-radius-sm);
    }
    
    .history-item:last-child {
      margin-bottom: 0;
    }
    
    .history-date {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      font-weight: var(--font-weight-medium);
    }
    
    .history-summary {
      margin-top: var(--spacing-xs);
      color: var(--text-primary);
    }
    
    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .checkbox-group {
        grid-template-columns: 1fr;
      }
      
      .form-actions {
        flex-direction: column;
      }
    }
  `],
  template: `
  <div class="container">
      <div class="profile-header">
        <h1>Mi Perfil</h1>
        <p class="text-muted">Actualiza tu información personal y profesional</p>
      </div>
      
    <div class="card">
        <form [formGroup]="f" (ngSubmit)="save()" aria-label="Formulario de perfil">
          <div class="form-section">
            <div class="form-section-title">
              <span>📧</span>
              <span>Información de Contacto</span>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="correoPersonal">Correo Personal</label>
                <input 
                  id="correoPersonal"
                  type="email"
                  formControlName="correoPersonal"
                  placeholder="correo@ejemplo.com"
                  autocomplete="email" />
              </div>
              
              <div class="form-group">
                <label for="telefonoMovil">Teléfono Móvil</label>
                <input 
                  id="telefonoMovil"
                  type="tel"
                  formControlName="telefonoMovil"
                  placeholder="+57 300 123 4567"
                  autocomplete="tel" />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="pais">País</label>
                <select 
                  id="pais"
                  formControlName="pais" 
                  (change)="onCountryChange($event.target.value)">
                  <option value="">Seleccione un país...</option>
                  <option *ngFor="let c of countries" [value]="c.code">
                    {{c.name}} ({{c.code}})
                  </option>
        </select>
              </div>
              
              <div class="form-group">
                <label for="ciudad">Ciudad</label>
                <select 
                  id="ciudad"
                  formControlName="ciudad"
                  [disabled]="!f.value.pais">
                  <option value="">Seleccione una ciudad...</option>
                  <option *ngFor="let city of cities" [value]="city">
                    {{city}}
                  </option>
        </select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">
              <span>💼</span>
              <span>Información Laboral</span>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="situacionLaboral">Situación Laboral</label>
                <select id="situacionLaboral" formControlName="situacionLaboral">
          <option value="">Seleccione...</option>
          <option value="EMPLEADO">Empleado</option>
          <option value="INDEPENDIENTE">Independiente/Freelance</option>
          <option value="EMPRENDEDOR">Emprendedor</option>
                  <option value="BUSCANDO">Buscando empleo</option>
          <option value="POSGRADO_OTRO">Posgrado/Otro</option>
        </select>
              </div>
              
              <div class="form-group">
                <label for="industria">Industria/Sector</label>
                <input 
                  id="industria"
                  type="text"
                  formControlName="industria"
                  placeholder="Ej: Tecnología, Educación, Salud..." />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="empresa">Empresa</label>
                <input 
                  id="empresa"
                  type="text"
                  formControlName="empresa"
                  placeholder="Nombre de la empresa" />
              </div>
              
              <div class="form-group">
                <label for="cargo">Cargo</label>
                <input 
                  id="cargo"
                  type="text"
                  formControlName="cargo"
                  placeholder="Tu cargo o posición" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">
              <span>⚙️</span>
              <span>Preferencias y Aportes</span>
            </div>
            
            <div class="checkbox-group">
              <div class="checkbox-item">
                <input 
                  type="checkbox" 
                  id="aporteMentoria"
                  [(ngModel)]="prefs.aporteMentoria" 
                  [ngModelOptions]="{standalone: true}" />
                <label for="aporteMentoria">Ofrecer Mentoría</label>
              </div>
              
              <div class="checkbox-item">
                <input 
                  type="checkbox" 
                  id="aporteOfertas"
                  [(ngModel)]="prefs.aporteOfertas" 
                  [ngModelOptions]="{standalone: true}" />
                <label for="aporteOfertas">Compartir Ofertas</label>
              </div>
              
              <div class="checkbox-item">
                <input 
                  type="checkbox" 
                  id="aporteConferencista"
                  [(ngModel)]="prefs.aporteConferencista" 
                  [ngModelOptions]="{standalone: true}" />
                <label for="aporteConferencista">Ser Conferencista</label>
              </div>
              
              <div class="checkbox-item">
                <input 
                  type="checkbox" 
                  id="intNoticiasFacultad"
                  [(ngModel)]="prefs.intNoticiasFacultad" 
                  [ngModelOptions]="{standalone: true}" />
                <label for="intNoticiasFacultad">Noticias por Facultad</label>
              </div>
              
              <div class="checkbox-item">
                <input 
                  type="checkbox" 
                  id="intEventosCiudad"
                  [(ngModel)]="prefs.intEventosCiudad" 
                  [ngModelOptions]="{standalone: true}" />
                <label for="intEventosCiudad">Eventos por Ciudad</label>
              </div>
              
              <div class="checkbox-item">
                <input 
                  type="checkbox" 
                  id="intOfertasSector"
                  [(ngModel)]="prefs.intOfertasSector" 
                  [ngModelOptions]="{standalone: true}" />
                <label for="intOfertasSector">Ofertas por Sector</label>
              </div>
              
              <div class="checkbox-item">
                <input 
                  type="checkbox" 
                  id="intPosgrados"
                  [(ngModel)]="prefs.intPosgrados" 
                  [ngModelOptions]="{standalone: true}" />
                <label for="intPosgrados">Información de Posgrados</label>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button 
              class="btn" 
              type="submit" 
              [disabled]="f.invalid || saving"
              [attr.aria-busy]="saving">
              <span *ngIf="!saving">💾 Guardar Cambios</span>
              <span *ngIf="saving">Guardando...</span>
            </button>
            <a routerLink="/panel" class="btn btn-outline">
              Cancelar
            </a>
        </div>
      </form>
    </div>

    <div class="card">
        <h2>Historial de Cambios</h2>
        <p class="text-muted" style="margin-bottom: var(--spacing-md);">
          Últimos 12 cambios realizados en tu perfil
        </p>
        <div *ngIf="history.length === 0" class="text-muted">
          No hay cambios registrados aún.
        </div>
        <div *ngFor="let h of history" class="history-item">
          <div class="history-date">{{h.createdAt || h.created_at}}</div>
          <div class="history-summary">{{h.summary}}</div>
        </div>
    </div>
  </div>
  `
})
export class ProfileComponent implements OnInit {
  f = this.fb.group({ correoPersonal:['',[Validators.email]], pais:[''], ciudad:[''], telefonoMovil:[''], situacionLaboral:[''], industria:[''], empresa:[''], cargo:[''] });
  prefs:any = { aporteMentoria:false, aporteOfertas:false, aporteConferencista:false, intNoticiasFacultad:false, intEventosCiudad:false, intOfertasSector:false, intPosgrados:false };
  countries:any[]=[]; cities:string[]=[]; saving=false; history:any[]=[];
  constructor(private fb: FormBuilder, private profile: ProfileService, private catalog: CatalogService, private toast: ToastService) {}
  ngOnInit(){ 
    const id = localStorage.getItem('graduateId'); 
    if(!id) {
      this.toast.error('Sesión inválida. Por favor, identifícate nuevamente.');
      return; 
    }
    const token = localStorage.getItem('gradToken');
    if(!token) {
      this.toast.error('Token de autenticación no encontrado. Por favor, identifícate nuevamente.');
      return;
    }
    this.profile.getProfile(id).subscribe({
      next: (p:any)=>{ 
        this.f.patchValue({ 
          correoPersonal:p.correoPersonal, 
          pais:p.pais, 
          ciudad:p.ciudad, 
          telefonoMovil:p.telefonoMovilE164, 
          situacionLaboral:p.situacionLaboral, 
          industria:p.industria, 
          empresa:p.empresa, 
          cargo:p.cargo 
        }); 
        this.prefs = { 
          aporteMentoria: !!p.aporteMentoria, 
          aporteOfertas: !!p.aporteOfertas, 
          aporteConferencista: !!p.aporteConferencista, 
          intNoticiasFacultad: !!p.intNoticiasFacultad, 
          intEventosCiudad: !!p.intEventosCiudad, 
          intOfertasSector: !!p.intOfertasSector, 
          intPosgrados: !!p.intPosgrados 
        }; 
      },
      error: (err) => {
        this.toast.error(err?.error?.error || 'Error al cargar el perfil. Verifica tu sesión.');
      }
    }); 
    this.catalog.countries().subscribe((cs:any)=> this.countries = cs); 
    this.profile.history(id).subscribe({
      next: (hs:any)=> this.history = hs,
      error: () => {} // Silenciar error de historial si falla
    }); 
  }
  onCountryChange(code:string){ this.cities=[]; if(code){ this.catalog.cities(code).subscribe((res:any)=> this.cities=res); this.f.patchValue({ ciudad: '' }); } }
  save(){ 
    const id = localStorage.getItem('graduateId'); 
    if(!id) {
      this.toast.error('Sesión inválida');
      return;
    }
    const token = localStorage.getItem('gradToken');
    if(!token) {
      this.toast.error('Token de autenticación no encontrado. Por favor, identifícate nuevamente.');
      return;
    }
    this.saving=true; 
    const v=this.f.value; 
    const body:any={ 
      graduateId: id, 
      correoPersonal: v.correoPersonal, 
      pais: v.pais, 
      ciudad: v.ciudad, 
      telefonoMovil: v.telefonoMovil, 
      situacionLaboral: v.situacionLaboral, 
      industria: v.industria, 
      empresa: v.empresa, 
      cargo: v.cargo, 
      ...this.prefs 
    }; 
    this.profile.updateProfile(body).subscribe({ 
      next: ()=>{ 
        this.saving=false; 
        this.toast.success('Perfil actualizado correctamente'); 
        this.profile.history(id).subscribe({
          next: (hs:any)=> this.history = hs,
          error: () => {} // Silenciar error de historial
        }); 
      }, 
      error: (e)=>{ 
        this.saving=false; 
        const errorMsg = e?.error?.error || 'Error al guardar. Revisa los campos.';
        this.toast.error(errorMsg); 
      } 
    }); 
  }
}
