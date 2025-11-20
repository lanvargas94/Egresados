import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

interface IdentifyResponse {
  status: 'onboarding'|'panel'|'no_encontrado'|'bloqueo';
  graduateId?: string;
  nombre?: string;
  mensaje?: string;
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private api: ApiService) {}

  identify(numeroIdentificacion: string) {
    return this.api.post<IdentifyResponse>('/auth/identify', { numeroIdentificacion }).pipe(
      tap(res => {
        if (res.graduateId) {
          localStorage.setItem('graduateId', res.graduateId);
        }
        if (res.nombre) {
          localStorage.setItem('graduateNombre', res.nombre);
        }
        if (res.token) {
          localStorage.setItem('gradToken', res.token);
        }
      })
    );
  }

  getGraduateId(): string | null { return localStorage.getItem('graduateId'); }
}

