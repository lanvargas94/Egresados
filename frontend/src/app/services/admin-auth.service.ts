import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  constructor(private api: ApiService) {}
  login(username: string, password: string) {
    return this.api.post<{token:string}>('/admin/auth/login', { username, password }).pipe(
      tap(res => localStorage.setItem('adminToken', res.token))
    );
  }
  logout() { localStorage.removeItem('adminToken'); }
}

