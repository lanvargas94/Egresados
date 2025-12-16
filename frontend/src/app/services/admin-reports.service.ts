import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface ReportItem {
  programa?: string;
  facultad?: string;
  anio?: number;
  estado?: string;
  eventoId?: string;
  eventoNombre?: string;
  total?: number;
  inscritos?: number;
}

export interface ReportResponse {
  items: ReportItem[];
}

@Injectable({ providedIn: 'root' })
export class AdminReportsService {
  constructor(private api: ApiService) {}

  reportGraduatesByProgram(): Observable<ReportResponse> {
    return this.api.get<ReportResponse>('/admin/reports/graduates-by-program');
  }

  reportGraduatesByYear(): Observable<ReportResponse> {
    return this.api.get<ReportResponse>('/admin/reports/graduates-by-year');
  }

  reportGraduatesByStatus(): Observable<ReportResponse> {
    return this.api.get<ReportResponse>('/admin/reports/graduates-by-status');
  }

  reportEventRegistrations(): Observable<ReportResponse> {
    return this.api.get<ReportResponse>('/admin/reports/event-registrations');
  }
}






