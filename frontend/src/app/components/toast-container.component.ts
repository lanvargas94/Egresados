import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { ToastMessage, ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .toasts { 
      position: fixed; 
      top: var(--spacing-lg); 
      right: var(--spacing-lg); 
      z-index: var(--z-toast);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      max-width: 420px;
      width: calc(100% - var(--spacing-xl));
    }
    
    .toast { 
      min-width: 260px; 
      max-width: 100%;
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: var(--border-radius-lg);
      color: var(--text-on-primary);
      box-shadow: var(--shadow-lg);
      opacity: 0;
      transform: translateX(100%);
      animation: slideIn 0.3s ease-out forwards;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      line-height: 1.5;
    }
    
    .toast.info { 
      background: var(--info);
    }
    
    .toast.success { 
      background: var(--success);
    }
    
    .toast.error { 
      background: var(--error);
    }
    
    .toast-icon {
      font-size: var(--font-size-lg);
      flex-shrink: 0;
    }
    
    @keyframes slideIn {
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @media (max-width: 768px) {
      .toasts {
        right: var(--spacing-md);
        left: var(--spacing-md);
        width: auto;
      }
    }
  `],
  template: `
    <div class="toasts" role="region" aria-live="polite" aria-label="Notificaciones">
      <div *ngFor="let t of items" class="toast {{t.type}}" role="alert">
        <span class="toast-icon">
          <span *ngIf="t.type === 'success'">✓</span>
          <span *ngIf="t.type === 'error'">✕</span>
          <span *ngIf="t.type === 'info'">ℹ</span>
        </span>
        <span>{{t.text}}</span>
      </div>
  </div>
  `
})
export class ToastContainerComponent implements OnDestroy {
  items: ToastMessage[] = [];
  private sub: Subscription;
  constructor(private toasts: ToastService) {
    this.sub = this.toasts.messages$.subscribe(m => {
      this.items = [...this.items, m];
      // auto-dismiss after 4s
      timer(4000).subscribe(() => this.items = this.items.filter(i => i.id !== m.id));
    });
  }
  ngOnDestroy() { this.sub.unsubscribe(); }
}

