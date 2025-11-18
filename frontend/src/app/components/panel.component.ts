import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileService } from '../services/profile.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .panel-header {
      margin-bottom: var(--spacing-xl);
    }
    
    .panel-header h1 {
      color: var(--primary);
      margin-bottom: var(--spacing-sm);
    }
    
    .panel-header p {
      color: var(--text-secondary);
      font-size: var(--font-size-lg);
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }
    
    .stat-card {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: var(--text-on-primary);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-md);
    }
    
    .stat-card.secondary {
      background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%);
    }
    
    .stat-card h3 {
      color: var(--text-on-primary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      margin: 0 0 var(--spacing-sm) 0;
      opacity: 0.9;
    }
    
    .stat-card .value {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      margin: 0;
    }
    
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }
    
    .action-card {
      background: var(--bg-primary);
      border: 2px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-lg);
      text-align: center;
      transition: all var(--transition-base);
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      display: block;
    }
    
    .action-card:hover {
      border-color: var(--primary);
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
    
    .action-card .icon {
      font-size: var(--font-size-4xl);
      margin-bottom: var(--spacing-sm);
    }
    
    .action-card h3 {
      margin: 0 0 var(--spacing-xs) 0;
      color: var(--primary);
    }
    
    .action-card p {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-md);
      border-radius: var(--border-radius-full);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }
    
    .status-badge.verified {
      background: var(--success-light);
      color: white;
    }
    
    .status-badge.pending {
      background: var(--warning);
      color: white;
    }
    
    .quick-links {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-md);
      margin-top: var(--spacing-lg);
    }
    
    .quick-link {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--gray-100);
      border-radius: var(--border-radius-md);
      text-decoration: none;
      color: var(--text-primary);
      font-weight: var(--font-weight-medium);
      transition: all var(--transition-base);
    }
    
    .quick-link:hover {
      background: var(--primary);
      color: var(--text-on-primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    
    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: var(--spacing-2xl);
    }
    
    @media (max-width: 768px) {
      .stats-grid,
      .actions-grid {
        grid-template-columns: 1fr;
      }
      
      .quick-links {
        flex-direction: column;
      }
      
      .quick-link {
        width: 100%;
        justify-content: center;
      }
    }
  `],
  template: `
  <div class="container">
      <div class="panel-header">
        <h1>Panel del Egresado</h1>
        <p>Bienvenido a tu espacio personal</p>
      </div>
      
      <div *ngIf="loading" class="loading-spinner" role="status" aria-label="Cargando perfil">
        <div class="loading"></div>
      </div>
      
      <ng-container *ngIf="!loading">
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Estado de Verificación</h3>
            <p class="value">
              <span *ngIf="perfil?.correoVerificado">✓ Verificado</span>
              <span *ngIf="!perfil?.correoVerificado">⏳ Pendiente</span>
            </p>
          </div>
          
          <div class="stat-card secondary">
            <h3>Mi Perfil</h3>
            <p class="value">Completo</p>
          </div>
        </div>
        
        <div class="card">
          <h2>Estado de Correo Electrónico</h2>
          <div style="display: flex; align-items: center; gap: var(--spacing-md); flex-wrap: wrap;">
            <span 
              class="status-badge"
              [class.verified]="perfil?.correoVerificado"
              [class.pending]="!perfil?.correoVerificado">
              <span *ngIf="perfil?.correoVerificado">✓</span>
              <span *ngIf="!perfil?.correoVerificado">⏳</span>
              <span *ngIf="perfil?.correoVerificado">Correo Verificado</span>
              <span *ngIf="!perfil?.correoVerificado">Verificación Pendiente</span>
            </span>
            <button 
              *ngIf="!perfil?.correoVerificado" 
              class="btn btn-sm" 
              (click)="resend()" 
              [disabled]="resending"
              [attr.aria-busy]="resending">
              <span *ngIf="!resending">Reenviar Confirmación</span>
              <span *ngIf="resending">Enviando...</span>
            </button>
          </div>
          <p *ngIf="!perfil?.correoVerificado" class="text-muted" style="margin-top: var(--spacing-sm);">
            Por favor, verifica tu correo electrónico para acceder a todas las funcionalidades.
          </p>
        </div>
        
        <div class="actions-grid">
          <a class="action-card" (click)="goProfile()" role="button" tabindex="0" (keydown.enter)="goProfile()">
            <div class="icon">👤</div>
            <h3>Editar Perfil</h3>
            <p>Actualiza tu información personal y profesional</p>
          </a>
          
          <a class="action-card" (click)="downloadCert()" role="button" tabindex="0" (keydown.enter)="downloadCert()">
            <div class="icon">📄</div>
            <h3>Descargar Constancia</h3>
            <p>Obtén tu constancia de egresado en PDF</p>
          </a>
        </div>
        
        <div class="card">
          <h2>Accesos Rápidos</h2>
          <div class="quick-links">
            <a routerLink="/news" class="quick-link">
              <span>📰</span>
              <span>Noticias</span>
            </a>
            <a routerLink="/jobs" class="quick-link">
              <span>💼</span>
              <span>Empleos</span>
            </a>
            <a routerLink="/events" class="quick-link">
              <span>📅</span>
              <span>Eventos</span>
            </a>
          </div>
        </div>
      </ng-container>
  </div>
  `
})
export class PanelComponent implements OnInit {
  perfil: any; 
  loading = true; 
  resending = false;
  
  constructor(
    private profile: ProfileService, 
    private toasts: ToastService, 
    private router: Router
  ) {}
  
  ngOnInit() {
    const id = localStorage.getItem('graduateId');
    if (!id) { 
      this.loading = false; 
      return; 
    }
    this.profile.getProfile(id).subscribe({
      next: p => { 
        this.perfil = p; 
        this.loading = false; 
      },
      error: () => { 
        this.loading = false; 
        this.toasts.error('No se pudo cargar el perfil'); 
      }
    });
  }
  
  resend() {
    const id = localStorage.getItem('graduateId'); 
    if (!id) return;
    this.resending = true;
    this.profile.resendConfirmation(id).subscribe({
      next: () => { 
        this.resending = false; 
        this.toasts.success('Correo de confirmación reenviado. Revisa tu bandeja de entrada.'); 
      },
      error: () => { 
        this.resending = false; 
        this.toasts.error('No se pudo reenviar el correo. Intenta más tarde.'); 
      }
    });
  }
  
  goProfile() { 
    this.router.navigate(['/profile']); 
  }
  
  downloadCert() { 
    const id = localStorage.getItem('graduateId');
    if (!id) { 
      this.toasts.error('Sin sesión activa'); 
      return; 
    }
    this.profile.downloadCertificate(id).subscribe({ 
      next: (blob: any) => { 
        const url = window.URL.createObjectURL(blob); 
        const a = document.createElement('a'); 
        a.href = url; 
        a.download = 'constancia-egresado.pdf'; 
        a.click(); 
        window.URL.revokeObjectURL(url);
        this.toasts.success('Constancia descargada exitosamente');
      }, 
      error: () => this.toasts.error('No se pudo descargar la constancia') 
    }); 
  }
}
