import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private api: ApiService) {}
  get apiBase(){ return (this.api as any)['base']; }

  confirmEmail(token: string) {
    return this.api.post('/profile/confirm-email', {}, { params: { token } as any });
  }

  resendConfirmation(graduateId: string) {
    // Using POST with query param for simplicity
    return this.api.post(`/profile/resend-confirmation?graduateId=${encodeURIComponent(graduateId)}`, {});
  }

  getProfile(graduateId: string) {
    return this.api.get(`/profile?graduateId=${encodeURIComponent(graduateId)}`);
  }

  updateProfile(body: any){ return this.api.put('/profile', body); }
  history(graduateId: string){ return this.api.get(`/profile/history?graduateId=${encodeURIComponent(graduateId)}`); }
  downloadCertificate(graduateId: string){
    return this.api.get(`/profile/certificate?graduateId=${encodeURIComponent(graduateId)}`, { responseType: 'blob' as any });
  }
}
