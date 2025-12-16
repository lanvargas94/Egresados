import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface AuditLog {
  id: number;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  summary: string;
  createdAt: string;
}

export interface AuditLogListResponse {
  items: AuditLog[];
  total: number;
  page: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class AdminAuditService {
  constructor(private api: ApiService) {}

  list(page: number = 0, size: number = 50, filters?: {
    from?: string;
    to?: string;
    actor?: string;
    entity?: string;
    action?: string;
  }): Observable<AuditLogListResponse> {
    const params: any = { page, size };
    if (filters?.from) params.from = filters.from;
    if (filters?.to) params.to = filters.to;
    if (filters?.actor) params.actor = filters.actor;
    if (filters?.entity) params.entity = filters.entity;
    if (filters?.action) params.action = filters.action;

    const query = new URLSearchParams(params).toString();
    return this.api.get<AuditLogListResponse>(`/admin/audit?${query}`);
  }
}






