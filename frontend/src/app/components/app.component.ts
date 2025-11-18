import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { ToastContainerComponent } from './toast-container.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastContainerComponent],
  styles: [`
    .app-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: var(--text-on-primary);
      padding: var(--spacing-lg) 0;
      box-shadow: var(--shadow-md);
      position: sticky;
      top: 0;
      z-index: var(--z-sticky);
    }
    
    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-md);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--spacing-md);
      
      @media (min-width: 768px) {
        padding: 0 var(--spacing-lg);
      }
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }
    
    .header-logo {
      height: 45px;
      width: auto;
      object-fit: contain;
      transition: opacity var(--transition-base);
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
    
    .header-logo:hover {
      opacity: 0.9;
    }
    
    .logo-section h1 {
      margin: 0;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-on-primary);
      
      @media (min-width: 768px) {
        font-size: var(--font-size-2xl);
      }
    }
    
    @media (max-width: 768px) {
      .header-logo {
        height: 32px;
      }
      
      .logo-section h1 {
        font-size: var(--font-size-lg);
      }
    }
    
    nav {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }
    
    nav a {
      color: var(--text-on-primary);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--border-radius-md);
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-sm);
      transition: all var(--transition-base);
      text-decoration: none;
      opacity: 0.9;
      
      &:hover, &:focus {
        background-color: rgba(255, 255, 255, 0.15);
        opacity: 1;
        text-decoration: none;
        outline: 2px solid rgba(255, 255, 255, 0.5);
        outline-offset: 2px;
      }
      
      &.active {
        background-color: rgba(255, 255, 255, 0.2);
        opacity: 1;
        font-weight: var(--font-weight-semibold);
      }
    }
    
    main {
      flex: 1;
      padding: var(--spacing-xl) 0;
    }
    
    footer {
      background-color: var(--gray-800);
      color: var(--gray-300);
      padding: var(--spacing-xl) 0;
      margin-top: auto;
      text-align: center;
      font-size: var(--font-size-sm);
    }
    
    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-md);
      
      @media (min-width: 768px) {
        padding: 0 var(--spacing-lg);
      }
    }
    
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }
      
      nav {
        width: 100%;
        justify-content: flex-start;
      }
      
      nav a {
        font-size: var(--font-size-xs);
        padding: var(--spacing-xs) var(--spacing-sm);
      }
    }
  `],
  template: `
    <div class="app-wrapper">
      <header role="banner">
        <div class="header-content">
          <div class="logo-section">
            <img 
              src="assets/logo.jpg" 
              alt="Logo CORHUILA"
              class="header-logo"
              (error)="$event.target.style.display='none'" />
            <h1>Plataforma de Egresados</h1>
          </div>
          <nav role="navigation" aria-label="Navegación principal">
            <a routerLink="/" 
               routerLinkActive="active" 
               [routerLinkActiveOptions]="{exact: true}"
               aria-label="Ir a inicio">Inicio</a>
            <a *ngIf="showOnboardingLink" 
               routerLink="/onboarding/step1" 
               routerLinkActive="active"
               aria-label="Completar onboarding">Onboarding</a>
            <a *ngIf="showPanelLink" 
               routerLink="/panel" 
               routerLinkActive="active"
               aria-label="Ir al panel">Panel</a>
            <a *ngIf="showProfileLink" 
               routerLink="/profile" 
               routerLinkActive="active"
               aria-label="Ver mi perfil">Mi Perfil</a>
            <a *ngIf="showAdminLink" 
               routerLink="/admin/news" 
               routerLinkActive="active"
               aria-label="Panel de administración">Admin</a>
          </nav>
        </div>
      </header>
      
      <main id="main-content" role="main">
        <router-outlet></router-outlet>
      </main>
      
      <footer role="contentinfo">
        <div class="footer-content">
          <p>&copy; {{ currentYear }} Corporación Universitaria del Huila - CORHUILA. Todos los derechos reservados.</p>
        </div>
      </footer>
      
      <app-toasts></app-toasts>
    </div>
  `
})
export class AppComponent {
  currentYear = new Date().getFullYear();
  showOnboardingLink = false;
  showPanelLink = false;
  showProfileLink = false;
  showAdminLink = false;

  constructor(private router: Router) {
    // Verificar si hay sesión activa
    this.updateNavigationLinks();
    
    // Actualizar enlaces cuando cambia la ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateNavigationLinks();
      });
  }

  private updateNavigationLinks() {
    const graduateId = localStorage.getItem('graduateId');
    const adminToken = localStorage.getItem('adminToken');
    
    this.showOnboardingLink = !!graduateId;
    this.showPanelLink = !!graduateId;
    this.showProfileLink = !!graduateId;
    this.showAdminLink = !!adminToken;
  }
}

