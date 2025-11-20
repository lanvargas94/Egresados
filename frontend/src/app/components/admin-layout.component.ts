import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AdminAuthService } from '../services/admin-auth.service';
import { AdminRoleService } from '../services/admin-role.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .admin-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--gray-50);
    }

    .admin-topbar {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: var(--text-on-primary);
      padding: var(--spacing-md) var(--spacing-lg);
      box-shadow: var(--shadow-md);
      position: sticky;
      top: 0;
      z-index: var(--z-sticky);
    }

    .topbar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
    }

    .topbar-logo {
      height: 40px;
      width: auto;
      object-fit: contain;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .topbar-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      margin: 0;
      color: var(--text-on-primary);
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs) var(--spacing-md);
      background: rgba(255, 255, 255, 0.15);
      border-radius: var(--border-radius-md);
    }

    .user-name {
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-sm);
    }

    .role-badge {
      padding: var(--spacing-xs) var(--spacing-sm);
      background: rgba(255, 255, 255, 0.25);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .admin-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .admin-sidebar {
      width: 260px;
      background: var(--bg-primary);
      border-right: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 73px;
      height: calc(100vh - 73px);
      overflow-y: auto;
      transition: transform var(--transition-base);
    }

    .admin-sidebar.collapsed {
      transform: translateX(-100%);
    }

    .sidebar-nav {
      padding: var(--spacing-md);
      flex: 1;
    }

    .nav-section {
      margin-bottom: var(--spacing-lg);
    }

    .nav-section-title {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
      padding: var(--spacing-sm) var(--spacing-md);
      margin-bottom: var(--spacing-xs);
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      color: var(--text-primary);
      text-decoration: none;
      border-radius: var(--border-radius-md);
      transition: all var(--transition-base);
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-sm);
      margin-bottom: var(--spacing-xs);
    }

    .nav-link:hover {
      background: var(--gray-100);
      color: var(--primary);
    }

    .nav-link.active {
      background: var(--primary);
      color: var(--text-on-primary);
      font-weight: var(--font-weight-semibold);
    }

    .nav-link-icon {
      font-size: var(--font-size-lg);
      width: 24px;
      text-align: center;
    }

    .admin-content {
      flex: 1;
      padding: var(--spacing-xl);
      overflow-y: auto;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }

    .sidebar-toggle {
      display: none;
      background: rgba(255, 255, 255, 0.15);
      border: none;
      color: var(--text-on-primary);
      padding: var(--spacing-sm);
      border-radius: var(--border-radius-md);
      cursor: pointer;
      font-size: var(--font-size-lg);
      transition: background var(--transition-base);
    }

    .sidebar-toggle:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    @media (max-width: 1024px) {
      .admin-sidebar {
        position: fixed;
        left: 0;
        z-index: var(--z-modal);
        height: 100vh;
        top: 73px;
        transform: translateX(-100%);
      }

      .admin-sidebar.open {
        transform: translateX(0);
      }

      .sidebar-toggle {
        display: block;
      }

      .admin-content {
        padding: var(--spacing-md);
      }
    }

    @media (max-width: 768px) {
      .topbar-title {
        font-size: var(--font-size-lg);
      }

      .user-info {
        flex-direction: column;
        align-items: flex-start;
        padding: var(--spacing-sm);
      }

      .topbar-content {
        flex-direction: column;
        align-items: stretch;
      }

      .topbar-left,
      .topbar-right {
        width: 100%;
        justify-content: space-between;
      }

      .admin-sidebar {
        width: 280px;
      }

      .admin-content {
        padding: var(--spacing-md);
      }
    }

    .sidebar-overlay {
      display: none;
      position: fixed;
      top: 73px;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: calc(var(--z-modal) - 1);
    }

    .sidebar-overlay.open {
      display: block;
    }

    @media (max-width: 1024px) {
      .sidebar-overlay {
        display: block;
        opacity: 0;
        pointer-events: none;
        transition: opacity var(--transition-base);
      }

      .sidebar-overlay.open {
        opacity: 1;
        pointer-events: all;
      }
    }
  `],
  template: `
    <div class="admin-wrapper">
      <div class="admin-topbar">
        <div class="topbar-content">
          <div class="topbar-left">
            <button 
              class="sidebar-toggle" 
              (click)="toggleSidebar()"
              [attr.aria-label]="sidebarOpen ? 'Cerrar menú' : 'Abrir menú'"
              [attr.aria-expanded]="sidebarOpen">
              ☰
            </button>
            <img 
              src="assets/logo.jpg" 
              alt="Logo CORHUILA"
              class="topbar-logo"
              (error)="$event.target.style.display='none'" />
            <h1 class="topbar-title">Panel Administrativo</h1>
          </div>
          <div class="topbar-right">
            <div class="user-info" *ngIf="userName">
              <span class="user-name">{{userName}}</span>
              <span class="role-badge" *ngIf="role">{{role === 'ADMIN_GENERAL' ? 'Administrador' : 'Admin Programa'}}</span>
            </div>
            <button 
              class="btn btn-sm" 
              (click)="logout()"
              style="background: rgba(255, 255, 255, 0.15); color: var(--text-on-primary); border: 1px solid rgba(255, 255, 255, 0.3);">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div class="admin-body">
        <div 
          class="sidebar-overlay" 
          [class.open]="sidebarOpen"
          (click)="closeSidebar()">
        </div>

        <aside 
          class="admin-sidebar" 
          [class.open]="sidebarOpen"
          role="navigation"
          aria-label="Menú de navegación administrativo">
          <nav class="sidebar-nav">
            <div class="nav-section">
              <div class="nav-section-title">Principal</div>
              <a 
                routerLink="/admin/graduates" 
                routerLinkActive="active"
                [routerLinkActiveOptions]="{exact: true}"
                class="nav-link"
                (click)="closeSidebar()">
                <span class="nav-link-icon">👥</span>
                <span>Egresados</span>
              </a>
              <a 
                routerLink="/admin/jobs" 
                routerLinkActive="active"
                [routerLinkActiveOptions]="{exact: true}"
                class="nav-link"
                (click)="closeSidebar()">
                <span class="nav-link-icon">💼</span>
                <span>Ofertas de Empleo</span>
              </a>
              <a 
                routerLink="/admin/events" 
                routerLinkActive="active"
                [routerLinkActiveOptions]="{exact: true}"
                class="nav-link"
                (click)="closeSidebar()">
                <span class="nav-link-icon">📅</span>
                <span>Eventos</span>
              </a>
              <a 
                routerLink="/admin/news" 
                routerLinkActive="active"
                [routerLinkActiveOptions]="{exact: true}"
                class="nav-link"
                (click)="closeSidebar()">
                <span class="nav-link-icon">📰</span>
                <span>Noticias</span>
              </a>
              <a 
                routerLink="/admin/banners" 
                routerLinkActive="active"
                [routerLinkActiveOptions]="{exact: true}"
                class="nav-link"
                (click)="closeSidebar()">
                <span class="nav-link-icon">🖼️</span>
                <span>Banners</span>
              </a>
            </div>

            <div class="nav-section" *ngIf="roleService.isAdminGeneral()">
              <div class="nav-section-title">Configuración</div>
              <a 
                routerLink="/admin/catalog" 
                routerLinkActive="active"
                [routerLinkActiveOptions]="{exact: true}"
                class="nav-link"
                (click)="closeSidebar()">
                <span class="nav-link-icon">📚</span>
                <span>Catálogos</span>
              </a>
              <a 
                routerLink="/admin/users" 
                routerLinkActive="active"
                [routerLinkActiveOptions]="{exact: true}"
                class="nav-link"
                (click)="closeSidebar()">
                <span class="nav-link-icon">👤</span>
                <span>Usuarios Admin</span>
              </a>
            </div>

            <div class="nav-section" *ngIf="roleService.isAdminGeneral()">
              <div class="nav-section-title">Reportes</div>
              <a 
                routerLink="/admin/reports" 
                routerLinkActive="active"
                [routerLinkActiveOptions]="{exact: true}"
                class="nav-link"
                (click)="closeSidebar()">
                <span class="nav-link-icon">📊</span>
                <span>Reportes</span>
              </a>
              <a 
                routerLink="/admin/audit" 
                routerLinkActive="active"
                [routerLinkActiveOptions]="{exact: true}"
                class="nav-link"
                (click)="closeSidebar()">
                <span class="nav-link-icon">📋</span>
                <span>Auditoría</span>
              </a>
            </div>
          </nav>
        </aside>

        <main class="admin-content" role="main">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent implements OnInit {
  sidebarOpen = false;
  userName: string | null = null;
  role: string | null = null;

  constructor(
    private router: Router,
    private auth: AdminAuthService,
    public roleService: AdminRoleService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    
    // Cerrar sidebar cuando cambia la ruta en móvil
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (window.innerWidth <= 1024) {
          this.closeSidebar();
        }
      });
  }

  loadUserInfo() {
    this.userName = localStorage.getItem('adminName') || 'Administrador';
    this.role = this.roleService.getRole();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.auth.logout();
      this.toast.success('Sesión cerrada');
      this.router.navigate(['/admin/login']);
    }
  }
}
