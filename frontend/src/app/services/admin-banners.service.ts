import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Banner {
  id: string;
  titulo: string;
  subtitulo?: string;
  imagenUrl?: string;
  enlaceAccion?: string;
  orden: number;
  activo: boolean;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface BannerListResponse {
  items: Banner[];
}

@Injectable({ providedIn: 'root' })
export class AdminBannersService {
  constructor(private api: ApiService) {}

  list(activos?: boolean): Observable<BannerListResponse> {
    const params = activos !== undefined ? `?activos=${activos}` : '';
    return this.api.get<BannerListResponse>(`/admin/banners${params}`);
  }

  get(id: string): Observable<Banner> {
    return this.api.get<Banner>(`/admin/banners/${id}`);
  }

  create(data: {
    titulo: string;
    subtitulo?: string;
    imagenUrl?: string;
    enlaceAccion?: string;
    orden?: number;
    activo: boolean;
  }): Observable<Banner> {
    return this.api.post<Banner>('/admin/banners', data);
  }

  update(id: string, data: {
    titulo?: string;
    subtitulo?: string;
    imagenUrl?: string;
    enlaceAccion?: string;
    orden?: number;
    activo?: boolean;
  }): Observable<Banner> {
    return this.api.put<Banner>(`/admin/banners/${id}`, data);
  }

  delete(id: string): Observable<{ ok: boolean }> {
    return this.api.delete<{ ok: boolean }>(`/admin/banners/${id}`);
  }
}



