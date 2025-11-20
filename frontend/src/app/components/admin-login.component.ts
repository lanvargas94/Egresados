import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styles: [`
    .admin-login-container {
      max-width: 450px;
      margin: 0 auto;
      padding: var(--spacing-2xl) 0;
    }
    
    .admin-login-card {
      background: var(--bg-primary);
      border-radius: var(--border-radius-xl);
      padding: var(--spacing-2xl);
      box-shadow: var(--shadow-lg);
      border-top: 4px solid var(--primary);
    }
    
    .admin-header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }
    
    .admin-header h2 {
      color: var(--primary);
      margin-bottom: var(--spacing-xs);
    }
    
    .admin-header .badge {
      display: inline-block;
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--gray-100);
      color: var(--text-secondary);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .form-group {
      margin-bottom: var(--spacing-lg);
    }
    
    .password-toggle {
      position: relative;
    }
    
    .password-toggle-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: var(--spacing-xs);
      font-size: var(--font-size-lg);
      z-index: 1;
      
      &:hover {
        color: var(--text-primary);
      }
      
      &:focus {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
        border-radius: var(--border-radius-sm);
      }
    }
    
    .submit-button {
      width: 100%;
      margin-top: var(--spacing-md);
    }
  `],
  template: `
    <div class="container">
      <div class="admin-login-container">
        <div class="admin-login-card">
          <div class="admin-header">
            <span class="badge">Área Administrativa</span>
            <h2>Iniciar Sesión</h2>
            <p class="text-muted" style="margin-top: var(--spacing-sm);">
              Acceso exclusivo para administradores
            </p>
          </div>
          
          <form [formGroup]="f" (ngSubmit)="submit()" aria-label="Formulario de inicio de sesión administrativo">
            <div class="form-group">
              <label for="username">Usuario</label>
              <input 
                id="username"
                type="text"
                formControlName="username"
                placeholder="Ingresa tu usuario"
                autocomplete="username"
                [attr.aria-invalid]="f.controls.username.invalid && f.controls.username.touched"
                autofocus />
              <div 
                class="error" 
                *ngIf="f.controls.username.invalid && f.controls.username.touched"
                role="alert">
                El usuario es requerido
              </div>
            </div>
            
            <div class="form-group">
              <label for="password">Contraseña</label>
              <div class="password-toggle">
                <input 
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Ingresa tu contraseña"
                  autocomplete="current-password"
                  [attr.aria-invalid]="f.controls.password.invalid && f.controls.password.touched" />
                <button 
                  type="button"
                  class="password-toggle-btn"
                  (click)="showPassword = !showPassword"
                  [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  tabindex="0">
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <div 
                class="error" 
                *ngIf="f.controls.password.invalid && f.controls.password.touched"
                role="alert">
                La contraseña es requerida
              </div>
            </div>
            
            <button 
              class="btn submit-button" 
              type="submit" 
              [disabled]="f.invalid || loading"
              [attr.aria-busy]="loading">
              <span *ngIf="!loading">Ingresar</span>
              <span *ngIf="loading">Verificando...</span>
            </button>
    </form>
        </div>
      </div>
    </div>
  `
})
export class AdminLoginComponent {
  f = this.fb.group({ 
    username: ['', Validators.required], 
    password: ['', Validators.required] 
  });
  loading = false;
  showPassword = false;
  
  constructor(
    private fb: FormBuilder, 
    private auth: AdminAuthService, 
    private toasts: ToastService,
    private router: Router
  ) {}
  
  submit() {
    if (this.f.invalid) {
      this.f.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.auth.login(this.f.value.username!, this.f.value.password!).subscribe({
      next: (res) => { 
        this.loading = false; 
        this.toasts.success('Sesión administrativa iniciada');
        // Redirigir al dashboard admin
        this.router.navigate(['/admin/graduates']);
      },
      error: (err) => { 
        this.loading = false; 
        const message = err?.error?.error || 'Credenciales inválidas. Verifica tu usuario y contraseña.';
        this.toasts.error(message); 
      }
    });
  }
}

