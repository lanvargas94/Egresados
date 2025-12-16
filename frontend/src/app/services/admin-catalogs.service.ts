import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Faculty {
  name: string;
}

export interface Program {
  id: number;
  facultyName: string;
  name: string;
}

export interface City {
  id: number;
  countryCode: string;
  name: string;
}

export interface CatalogListResponse {
  items: any[];
}

@Injectable({ providedIn: 'root' })
export class AdminCatalogsService {
  constructor(private api: ApiService) {}

  // Facultades
  listFaculties(): Observable<CatalogListResponse> {
    return this.api.get<CatalogListResponse>('/admin/catalogs/faculties');
  }

  createFaculty(name: string): Observable<Faculty> {
    return this.api.post<Faculty>('/admin/catalogs/faculties', { name });
  }

  // Programas
  listPrograms(faculty?: string): Observable<CatalogListResponse> {
    const params = faculty ? `?faculty=${faculty}` : '';
    return this.api.get<CatalogListResponse>(`/admin/catalogs/programs${params}`);
  }

  createProgram(facultyName: string, name: string): Observable<Program> {
    return this.api.post<Program>('/admin/catalogs/programs', { facultyName, name });
  }

  updateProgram(id: number, name: string): Observable<Program> {
    return this.api.put<Program>(`/admin/catalogs/programs/${id}`, { name });
  }

  // Ciudades
  listCities(countryCode?: string): Observable<CatalogListResponse> {
    const params = countryCode ? `?countryCode=${countryCode}` : '';
    return this.api.get<CatalogListResponse>(`/admin/catalogs/cities${params}`);
  }

  createCity(countryCode: string, name: string): Observable<City> {
    return this.api.post<City>('/admin/catalogs/cities', { countryCode, name });
  }

  updateCity(id: number, name: string): Observable<City> {
    return this.api.put<City>(`/admin/catalogs/cities/${id}`, { name });
  }
}






