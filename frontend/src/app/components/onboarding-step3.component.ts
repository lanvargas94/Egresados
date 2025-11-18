import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OnboardingService } from '../services/onboarding.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-onboarding-step3',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <div class="container">
    <h2>Paso 3 – Conecta y Participa (100%)</h2>
    <div class="card">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label><input type="checkbox" formControlName="consentimiento" /> Acepto la Política de Tratamiento de Datos Personales</label>
        <p class="error" *ngIf="form.value.consentimiento === false && touched">Debes aceptar la política</p>
        <br/>
        <button class="btn" type="submit" [disabled]="loading">Finalizar y Unirme</button>
      </form>
      <p *ngIf="mensaje" class="error" style="margin-top:8px">{{mensaje}}</p>
    </div>
  </div>
  `
})
export class OnboardingStep3Component {
  form = this.fb.group({ consentimiento: [false] });
  loading = false; mensaje = ''; touched = false;
  constructor(private fb: FormBuilder, private ob: OnboardingService, private auth: AuthService, private router: Router, private toasts: ToastService) {}

  submit() {
    this.touched = true;
    const value = this.form.value.consentimiento === true;
    if (!value) { this.mensaje = 'Debes aceptar la política'; this.toasts.error(this.mensaje); return; }
    const id = this.auth.getGraduateId();
    if (!id) { this.mensaje = 'Sesión inválida. Vuelve a identificarte.'; return; }
    this.loading = true; this.mensaje = '';
    this.ob.saveStep3(id, true).subscribe({
      next: () => { this.loading = false; this.toasts.success('Onboarding completado. ¡Bienvenido!'); this.router.navigate(['/panel']); },
      error: () => { this.loading = false; this.mensaje = 'Error al finalizar. Intenta de nuevo.'; this.toasts.error(this.mensaje); }
    });
  }
}
