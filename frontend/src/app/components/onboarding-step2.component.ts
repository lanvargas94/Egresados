import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OnboardingService } from '../services/onboarding.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-onboarding-step2',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  template: `
  <div class="container">
    <h2>Paso 2 – Tu Huella Profesional (66%)</h2>
    <div class="card">
      <div class="card" style="background:#f8f9fa">
        <h3>Importar desde LinkedIn (v1)</h3>
        <p>Pega aquí tu titular/cargo y empresa (texto de tu perfil):</p>
        <textarea [(ngModel)]="linkedinText" rows="3" style="width:100%" placeholder="Ej: Desarrollador de Software en ACME"></textarea>
        <button class="btn" (click)="importLinkedIn()" style="margin-top:8px;">Importar</button>
      </div>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>Situación laboral</label>
        <select formControlName="situacionLaboral">
          <option value="">Seleccione...</option>
          <option value="EMPLEADO">Empleado</option>
          <option value="INDEPENDIENTE">Independiente/Freelance</option>
          <option value="EMPRENDEDOR">Emprendedor</option>
          <option value="BUSCANDO">Buscando</option>
          <option value="POSGRADO_OTRO">Posgrado/Otro</option>
        </select>
        <div class="error" *ngIf="form.controls.situacionLaboral.invalid && form.controls.situacionLaboral.touched">Requerido</div>

        <label>Industria/Sector</label>
        <input formControlName="industria" placeholder="Tecnología" />

        <label>Empresa/Organización</label>
        <input formControlName="empresa" placeholder="MiEmpresa" maxlength="120" />

        <label>Cargo</label>
        <input formControlName="cargo" placeholder="Desarrollador" maxlength="120" />

        <br/><br/>
        <button class="btn" type="submit" [disabled]="form.invalid || loading">Siguiente</button>
      </form>
      <p *ngIf="mensaje" class="error" style="margin-top:8px">{{mensaje}}</p>
    </div>
  </div>
  `
})
export class OnboardingStep2Component {
  form = this.fb.group({
    situacionLaboral: ['', Validators.required],
    industria: [''],
    empresa: [''],
    cargo: ['']
  });
  linkedinText = '';
  loading = false; mensaje = '';
  constructor(private fb: FormBuilder, private ob: OnboardingService, private auth: AuthService, private router: Router, private toasts: ToastService) {}

  submit() {
    if (this.form.invalid) return;
    const id = this.auth.getGraduateId();
    if (!id) { this.mensaje = 'Sesión inválida. Vuelve a identificarte.'; return; }
    this.loading = true; this.mensaje = '';
    const v = this.form.value;
    this.ob.saveStep2(id, v.situacionLaboral!, v.industria || undefined, v.empresa || undefined, v.cargo || undefined).subscribe({
      next: () => { this.loading = false; this.toasts.success('Paso 2 guardado.'); this.router.navigate(['/onboarding/step3']); },
      error: () => { this.loading = false; this.mensaje = 'Error al guardar. Revisa los campos.'; this.toasts.error(this.mensaje); }
    });
  }

  importLinkedIn() {
    const text = (this.linkedinText || '').trim();
    if (!text) return;
    // Heurística simple: "Cargo en Empresa"
    const enIdx = text.toLowerCase().indexOf(' en ');
    if (enIdx > 0) {
      const cargo = text.substring(0, enIdx).trim();
      const empresa = text.substring(enIdx + 4).trim();
      this.form.patchValue({ cargo, empresa });
      this.toasts.success('Importado desde texto de LinkedIn');
    } else {
      // Otra heurística: primer token como cargo, resto empresa
      const parts = text.split('-');
      if (parts.length >= 2) {
        this.form.patchValue({ cargo: parts[0].trim(), empresa: parts.slice(1).join('-').trim() });
        this.toasts.success('Importado desde texto de LinkedIn');
      } else {
        this.toasts.error('No se pudo inferir cargo/empresa');
      }
    }
  }
}
