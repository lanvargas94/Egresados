import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OnboardingService } from '../services/onboarding.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { CatalogService } from '../services/catalog.service';
import { ValidationService } from '../services/validation.service';

@Component({
  selector: 'app-onboarding-step1',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <div class="container">
    <h2>Paso 1 – Verifica y Conecta (33%)</h2>
    <div class="card">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>Correo personal</label>
        <input formControlName="correoPersonal" (blur)="onEmailBlur()" placeholder="tu@email.com" />
        <div class="error" *ngIf="form.controls.correoPersonal.invalid && form.controls.correoPersonal.touched">Correo válido requerido</div>

    <label>País</label>
    <select formControlName="pais" (change)="onCountryChange($event.target.value)">
      <option value="">Seleccione...</option>
      <option *ngFor="let c of countries" [value]="c.code">{{c.name}} ({{c.code}})</option>
    </select>
        <div class="error" *ngIf="form.controls.pais.invalid && form.controls.pais.touched">Requerido</div>

    <label>Ciudad</label>
    <select formControlName="ciudad">
      <option value="">Seleccione...</option>
      <option *ngFor="let city of cities" [value]="city">{{city}}</option>
    </select>
        <div class="error" *ngIf="form.controls.ciudad.invalid && form.controls.ciudad.touched">Requerido</div>

        <label>Teléfono móvil (E.164)</label>
        <input formControlName="telefonoMovil" placeholder="+57xxxxxxxxxx" />
        <br/><br/>
        <button class="btn" type="submit" [disabled]="form.invalid || loading">Siguiente</button>
      </form>
      <p *ngIf="mensaje" class="error" style="margin-top:8px">{{mensaje}}</p>
    </div>
  </div>
  `
})
export class OnboardingStep1Component {
  form = this.fb.group({
    correoPersonal: ['', [Validators.required, Validators.email]],
    pais: ['', Validators.required],
    ciudad: ['', Validators.required],
    telefonoMovil: ['']
  });
  loading = false; mensaje = '';
  countries: any[] = []; cities: string[] = [];
  constructor(private fb: FormBuilder, private ob: OnboardingService, private auth: AuthService, private router: Router, private toasts: ToastService, private catalog: CatalogService, private validator: ValidationService) {
    this.catalog.countries().subscribe((res: any) => this.countries = res);
  }

  onCountryChange(code: string) {
    this.cities = [];
    if (code) {
      this.catalog.cities(code).subscribe((res: any) => this.cities = res);
      this.form.patchValue({ ciudad: '' });
      // RN-P03: autoselección de prefijo desde catálogo
      const current = this.form.value.telefonoMovil || '';
      const country = this.countries.find((c:any)=>c.code===code);
      const prefix = country?.dialCode || '+';
      if (!current || current.startsWith('+')) {
        this.form.patchValue({ telefonoMovil: prefix });
      }
    }
  }

  onEmailBlur() {
    const email = this.form.value.correoPersonal || '';
    if (!email) return;
    const gradId = this.auth.getGraduateId() || undefined;
    this.validator.emailAvailable(email, gradId).subscribe((res: any) => {
      if (!res.available) {
        this.toasts.error('Este correo ya está en uso');
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const id = this.auth.getGraduateId();
    if (!id) { 
      this.mensaje = 'Sesión inválida. Vuelve a identificarte.'; 
      this.toasts.error(this.mensaje);
      return; 
    }
    this.loading = true; 
    this.mensaje = '';
    const v = this.form.value;
    this.ob.saveStep1(id, v.correoPersonal!, v.pais!, v.ciudad!, v.telefonoMovil || undefined).subscribe({
      next: () => { 
        this.loading = false; 
        this.toasts.success('Paso 1 guardado correctamente'); 
        this.router.navigate(['/onboarding/step2']); 
      },
      error: (err) => { 
        this.loading = false;
        const errorMsg = err?.error?.error || 'Error al guardar. Revisa los campos.';
        this.mensaje = errorMsg;
        this.toasts.error(errorMsg);
      }
    });
  }
}
