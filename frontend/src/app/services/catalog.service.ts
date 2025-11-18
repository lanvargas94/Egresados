import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  constructor(private api: ApiService) {}
  countries() { return this.api.get('/catalog/countries'); }
  cities(country: string) { return this.api.get(`/catalog/cities?country=${encodeURIComponent(country)}`); }
  faculties() { return this.api.get('/catalog/faculties'); }
  programs(faculty: string) { return this.api.get(`/catalog/programs?faculty=${encodeURIComponent(faculty)}`); }
  sectors() { return this.api.get('/catalog/sectors'); }
  contractTypes() { return this.api.get('/catalog/contract-types'); }
}
