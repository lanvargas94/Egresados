import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-identification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styles: [`
    .identification-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
      padding: var(--spacing-xl) var(--spacing-md);
    }
    
    .identification-container {
      max-width: 480px;
      width: 100%;
    }
    
    .welcome-section {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }
    
    .welcome-section h2 {
      color: var(--primary);
      margin-bottom: var(--spacing-sm);
      font-size: var(--font-size-2xl);
    }
    
    .welcome-section p {
      color: var(--text-secondary);
      font-size: var(--font-size-base);
    }
    
    .form-card {
      background: var(--bg-primary);
      border-radius: var(--border-radius-xl);
      padding: var(--spacing-2xl);
      box-shadow: var(--shadow-xl);
      border-top: 4px solid var(--primary);
    }
    
    .form-group {
      margin-bottom: var(--spacing-lg);
    }
    
    .input-icon {
      position: relative;
    }
    
    .input-icon input {
      padding-left: 48px;
    }
    
    .input-icon::before {
      content: '🆔';
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      font-size: var(--font-size-lg);
      z-index: 1;
    }
    
    .submit-button {
      width: 100%;
      margin-top: var(--spacing-md);
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    }
    
    .submit-button:hover:not(:disabled) {
      background: linear-gradient(135deg, var(--primary-hover) 0%, var(--primary) 100%);
    }
    
    .help-text {
      margin-top: var(--spacing-lg);
      padding: var(--spacing-md);
      background: var(--gray-50);
      border-radius: var(--border-radius-md);
      border-left: 4px solid var(--primary);
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }
    
    .help-text strong {
      color: var(--primary);
      display: block;
      margin-bottom: var(--spacing-xs);
    }
    
  `],
  template: `
    <div class="identification-wrapper">
      <div class="identification-container">
        <div class="welcome-section">
          <h2>Bienvenido a la Plataforma de Egresados</h2>
          <p>Ingresa tu número de identificación para continuar</p>
        </div>
        
        <div class="form-card">
          <form [formGroup]="form" (ngSubmit)="submit()" aria-label="Formulario de identificación">
            <div class="form-group">
              <label for="numero">Número de Identificación</label>
              <div class="input-icon">
                <input 
                  id="numero"
                  type="text"
                  formControlName="numero" 
                  placeholder="CC, CE o Pasaporte"
                  [attr.aria-invalid]="form.controls.numero.invalid && form.controls.numero.touched"
                  [attr.aria-describedby]="form.controls.numero.invalid && form.controls.numero.touched ? 'numero-error' : null"
                  autocomplete="off"
                  autofocus />
              </div>
              <div 
                id="numero-error"
                class="error" 
                *ngIf="form.controls.numero.invalid && form.controls.numero.touched"
                role="alert">
                El número de identificación es requerido
              </div>
            </div>
            
            <button 
              class="btn submit-button" 
              type="submit" 
              [disabled]="form.invalid || loading"
              [attr.aria-busy]="loading">
              <span *ngIf="!loading">Continuar</span>
              <span *ngIf="loading">Verificando...</span>
            </button>
            
            <div *ngIf="mensaje" class="error" role="alert" style="margin-top: var(--spacing-md);">
              {{mensaje}}
            </div>
      </form>
          
          <div class="help-text">
            <strong>¿Necesitas ayuda?</strong>
            Asegúrate de ingresar tu número de identificación sin puntos ni espacios. 
            Si tienes problemas, contacta al área de Registro.
          </div>
        </div>
    </div>
  </div>
  `
})
export class IdentificationComponent {
  form = this.fb.group({ numero: ['', [Validators.required, Validators.minLength(5)]] });
  loading = false;
  mensaje = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private toasts: ToastService) {}

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true; 
    this.mensaje = '';
    this.auth.identify(this.form.value.numero!).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.status === 'onboarding') {
          this.toasts.success('Bienvenido. Continúa con el Onboarding.');
          this.router.navigate(['/onboarding/step1']);
        } else if (res.status === 'panel') {
          this.toasts.success('Bienvenido de vuelta.');
          this.router.navigate(['/panel']);
        } else if (res.status === 'no_encontrado') {
          this.mensaje = res.mensaje || 'No encontrado en nuestros registros. Verifica tu número de identificación.';
          this.toasts.error(this.mensaje);
        } else if (res.status === 'bloqueo') {
          this.mensaje = res.mensaje || 'Documento con múltiples coincidencias. Por favor, contacta al área de Registro.';
          this.toasts.error(this.mensaje);
        }
      },
      error: () => { 
        this.loading = false; 
        this.mensaje = 'Error del servidor. Por favor, intenta de nuevo más tarde.'; 
        this.toasts.error(this.mensaje); 
      }
    });
  }
}
