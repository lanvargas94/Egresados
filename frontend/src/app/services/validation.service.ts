import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ValidationService {
  constructor(private api: ApiService) {}
  emailAvailable(email: string, excludeGraduateId?: string) {
    let url = `/public/validate/email-available?email=${encodeURIComponent(email)}`;
    if (excludeGraduateId) url += `&excludeGraduateId=${encodeURIComponent(excludeGraduateId)}`;
    return this.api.get(url);
  }
}

