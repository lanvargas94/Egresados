import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'info' | 'success' | 'error';
export interface ToastMessage { id: number; text: string; type: ToastType; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _messages = new Subject<ToastMessage>();
  messages$ = this._messages.asObservable();
  private seq = 0;

  show(text: string, type: ToastType = 'info', timeoutMs = 4000) {
    const msg: ToastMessage = { id: ++this.seq, text, type };
    this._messages.next(msg);
    // Consumers handle auto-dismiss; no state stored here to keep it simple.
  }

  info(text: string) { this.show(text, 'info'); }
  success(text: string) { this.show(text, 'success'); }
  error(text: string) { this.show(text, 'error'); }
}

