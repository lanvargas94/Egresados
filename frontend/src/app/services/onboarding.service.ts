import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  constructor(private api: ApiService) {}

  saveStep1(graduateId: string, correoPersonal: string, pais: string, ciudad: string, telefonoMovil?: string) {
    return this.api.put('/onboarding/step1', { 
      graduateId: graduateId, // Se enviará como string y Spring lo convertirá a UUID
      correoPersonal, 
      pais, 
      ciudad, 
      telefonoMovil: telefonoMovil || null 
    });
  }

  saveStep2(graduateId: string, situacionLaboral: string, industria?: string, empresa?: string, cargo?: string) {
    return this.api.put('/onboarding/step2', { graduateId, situacionLaboral, industria, empresa, cargo });
  }

  saveStep3(graduateId: string, consentimiento: boolean) {
    return this.api.put('/onboarding/step3', { graduateId, consentimiento });
  }
}

