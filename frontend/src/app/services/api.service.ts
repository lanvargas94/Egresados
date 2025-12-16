import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  post<T>(path: string, body: any, options?: any): Observable<T> {
    const req = options
      ? this.http.post(`${this.base}${path}`, body, options)
      : this.http.post(`${this.base}${path}`, body);
    return req as unknown as Observable<T>;
  }
  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.base}${path}`, body);
  }
  get<T>(path: string, options?: any): Observable<T> {
    const req = options
      ? this.http.get(`${this.base}${path}`, { ...options, observe: 'body', responseType: options.responseType || 'json' })
      : this.http.get(`${this.base}${path}`);
    return req as unknown as Observable<T>;
  }
  delete<T>(path: string, options?: any): Observable<T> {
    const req = options
      ? this.http.delete(`${this.base}${path}`, options)
      : this.http.delete(`${this.base}${path}`);
    return req as unknown as Observable<T>;
  }
}
