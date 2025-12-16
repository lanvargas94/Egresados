import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Graduate {
  id: string;
  identificacion: string;
  nombreLegal: string;
  correoPersonal?: string;
  pais?: string;
  ciudad?: string;
  telefonoMovilE164?: string;
  situacionLaboral?: string;
  industria?: string;
  empresa?: string;
  cargo?: string;
  estado?: 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';
  observacionesInternas?: string;
  correoVerificado: boolean;
  onboardingCompleto: boolean;
  programas?: Array<{ facultad: string; programa: string; anio: number }>;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface GraduateFilters {
  programa?: string;
  anioGraduacion?: number;
  estado?: 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';
  ciudad?: string;
  identificacion?: string;
  nombre?: string;
}

export interface GraduateListResponse {
  items: Graduate[];
  total: number;
  page: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class AdminGraduatesService {
  constructor(private api: ApiService) {}

  list(filters: GraduateFilters, page: number = 0, size: number = 10): Observable<GraduateListResponse> {
    const params: any = { page, size };
    if (filters.programa) params.programa = filters.programa;
    if (filters.anioGraduacion) params.anioGraduacion = filters.anioGraduacion;
    if (filters.estado) params.estado = filters.estado;
    if (filters.ciudad) params.ciudad = filters.ciudad;
    if (filters.identificacion) params.identificacion = filters.identificacion;
    if (filters.nombre) params.nombre = filters.nombre;

    const query = new URLSearchParams(params).toString();
    return this.api.get<GraduateListResponse>(`/admin/graduates?${query}`);
  }

  get(id: string): Observable<Graduate> {
    return this.api.get<Graduate>(`/admin/graduates/${id}`);
  }

  update(id: string, data: {
    correoPersonal?: string;
    pais?: string;
    ciudad?: string;
    telefonoMovil?: string;
    observacionesInternas?: string;
    estado?: 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';
  }): Observable<Graduate> {
    return this.api.put<Graduate>(`/admin/graduates/${id}`, data);
  }

  changeStatus(id: string, estado: 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO'): Observable<Graduate> {
    return this.api.put<Graduate>(`/admin/graduates/${id}/status`, { estado });
  }

  sendBulkEmail(formData: FormData): Observable<any> {
    return this.api.post<any>(`/admin/graduates/bulk-email`, formData);
  }
}






