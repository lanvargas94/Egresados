import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { GradAuthService } from '../services/grad-auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-login-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styles: [`
    .login-container {
      max-width: 500px;
      margin: 0 auto;
    }
    
    .login-card {
      background: var(--bg-primary);
      border-radius: var(--border-radius-xl);
      padding: var(--spacing-2xl);
      box-shadow: var(--shadow-lg);
    }
    
    .login-header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }
    
    .login-header h2 {
      color: var(--primary);
      margin-bottom: var(--spacing-sm);
    }
    
    .login-header p {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }
    
    .form-section {
      margin-bottom: var(--spacing-xl);
    }
    
    .form-section:last-of-type {
      margin-bottom: 0;
    }
    
    .form-group {
      margin-bottom: var(--spacing-md);
    }
    
    .otp-input {
      text-align: center;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      letter-spacing: 0.5em;
      font-family: 'Courier New', monospace;
    }
    
    .code-sent {
      padding: var(--spacing-md);
      background: var(--success-light);
      color: white;
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-md);
      font-size: var(--font-size-sm);
      text-align: center;
    }
    
    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: var(--spacing-xl) 0;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }
    
    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid var(--border-color);
    }
    
    .divider::before {
      margin-right: var(--spacing-md);
    }
    
    .divider::after {
      margin-left: var(--spacing-md);
    }
  `],
  template: `
  <div class="container">
      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <h2>Ingreso con Código OTP</h2>
            <p>Recibirás un código de verificación en tu correo electrónico</p>
          </div>
          
          <form [formGroup]="f" (ngSubmit)="submit()" aria-label="Formulario de ingreso con OTP">
            <div class="form-section">
              <div class="form-group">
                <label for="identificacion">Número de Identificación</label>
                <input 
                  id="identificacion"
                  type="text"
                  formControlName="identificacion"
                  placeholder="Ingresa tu número de identificación"
                  [attr.aria-invalid]="f.controls.identificacion.invalid && f.controls.identificacion.touched"
                  autocomplete="off" />
                <div 
                  class="error" 
                  *ngIf="f.controls.identificacion.invalid && f.controls.identificacion.touched"
                  role="alert">
                  La identificación es requerida
                </div>
              </div>
              
              <button 
                class="btn" 
                type="button" 
                (click)="request()" 
                [disabled]="f.controls.identificacion.invalid || loading || codeSent"
                [attr.aria-busy]="loading">
                <span *ngIf="!loading">Enviar código</span>
                <span *ngIf="loading">Enviando...</span>
              </button>
              
              <div *ngIf="codeSent" class="code-sent" role="status">
                ✓ Código enviado. Revisa tu correo electrónico.
              </div>
            </div>
            
            <div class="divider" *ngIf="codeSent">Ingresa el código recibido</div>
            
            <div class="form-section" *ngIf="codeSent">
              <div class="form-group">
                <label for="code">Código de Verificación (OTP)</label>
                <input 
                  id="code"
                  type="text"
                  formControlName="code" 
                  maxlength="6"
                  class="otp-input"
                  placeholder="000000"
                  [attr.aria-invalid]="f.controls.code.invalid && f.controls.code.touched"
                  autocomplete="one-time-code"
                  inputmode="numeric"
                  pattern="[0-9]*" />
                <div 
                  class="error" 
                  *ngIf="f.controls.code.invalid && f.controls.code.touched"
                  role="alert">
                  El código es requerido
                </div>
              </div>
              
              <button 
                class="btn" 
                type="submit" 
                [disabled]="f.invalid || loading"
                [attr.aria-busy]="loading"
                style="width: 100%;">
                <span *ngIf="!loading">Ingresar</span>
                <span *ngIf="loading">Verificando...</span>
              </button>
            </div>
      </form>
        </div>
    </div>
  </div>
  `
})
export class LoginOtpComponent {
  f = this.fb.group({ 
    identificacion: ['', [Validators.required, Validators.minLength(5)]], 
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]] 
  });
  loading = false;
  codeSent = false;
  
  constructor(
    private fb: FormBuilder, 
    private auth: GradAuthService, 
    private toasts: ToastService, 
    private router: Router
  ) {}
  
  request() {
    if (this.f.controls.identificacion.invalid) {
      this.f.controls.identificacion.markAsTouched();
      return;
    }
    this.loading = true;
    this.auth.requestOtp(this.f.value.identificacion!).subscribe({
      next: () => { 
        this.loading = false; 
        this.codeSent = true;
        this.toasts.info('Código enviado. Revisa tu correo electrónico.'); 
      },
      error: () => { 
        this.loading = false; 
        this.toasts.error('No se pudo enviar el código. Verifica tu identificación.'); 
      }
    });
  }
  
  submit() {
    if (this.f.invalid) {
      this.f.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.auth.loginOtp(this.f.value.identificacion!, this.f.value.code!).subscribe({
      next: () => { 
        this.loading = false; 
        this.toasts.success('Ingreso exitoso');
        this.router.navigate(['/panel']); 
      },
      error: () => { 
        this.loading = false; 
        this.toasts.error('Código inválido o expirado. Solicita uno nuevo.'); 
      }
    });
  }
}

