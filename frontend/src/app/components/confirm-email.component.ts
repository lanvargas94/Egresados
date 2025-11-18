import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../services/profile.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="container">
    <div class="card">
      <h2>Confirmación de correo</h2>
      <p *ngIf="state==='loading'">Confirmando tu correo, por favor espera…</p>
      <div *ngIf="state==='ok'">
        <p>¡Tu correo fue confirmado correctamente!</p>
        <a class="btn" routerLink="/panel">Ir al Panel</a>
      </div>
      <div *ngIf="state==='error'">
        <p class="error">No pudimos confirmar tu correo. El enlace puede haber expirado.</p>
        <button class="btn" (click)="resend()" [disabled]="resending || !canResend">Reenviar confirmación</button>
        <p *ngIf="!canResend">Inicia sesión con tu documento para poder reenviar.</p>
        <a routerLink="/" style="margin-left:8px">Ir al inicio</a>
      </div>
    </div>
  </div>
  `
})
export class ConfirmEmailComponent implements OnInit {
  state: 'loading'|'ok'|'error' = 'loading';
  token: string | null = null;
  resending = false;
  canResend = false;

  constructor(private route: ActivatedRoute, private router: Router, private profile: ProfileService, private toasts: ToastService) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    const gradId = localStorage.getItem('graduateId');
    this.canResend = !!gradId;
    if (!this.token) { this.state = 'error'; return; }
    this.profile.confirmEmail(this.token).subscribe({
      next: () => { this.state = 'ok'; this.toasts.success('Correo confirmado'); },
      error: () => { this.state = 'error'; this.toasts.error('No se pudo confirmar el correo'); }
    });
  }

  resend() {
    const gradId = localStorage.getItem('graduateId');
    if (!gradId) { this.toasts.error('Debes iniciar sesión para reenviar'); return; }
    this.resending = true;
    this.profile.resendConfirmation(gradId).subscribe({
      next: () => { this.resending = false; this.toasts.success('Correo de confirmación reenviado'); },
      error: () => { this.resending = false; this.toasts.error('No se pudo reenviar'); }
    });
  }
}

