import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GradAuthService {
  private tokenKey = 'gradToken';
  constructor(private api: ApiService) {}

  requestOtp(identificacion: string) {
    return this.api.post('/auth/request-otp', { identificacion });
  }
  loginOtp(identificacion: string, code: string) {
    return this.api.post<{token:string, graduateId:string, nombre:string}>('/auth/login-otp', { identificacion, code }).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        if (res.graduateId) localStorage.setItem('graduateId', res.graduateId);
        if (res.nombre) localStorage.setItem('graduateNombre', res.nombre);
      })
    );
  }
  get token() { return localStorage.getItem(this.tokenKey); }
  logout() { localStorage.removeItem(this.tokenKey); }
}

