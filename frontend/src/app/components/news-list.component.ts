import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CatalogService } from '../services/catalog.service';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    .news-header {
      margin-bottom: var(--spacing-xl);
    }
    
    .news-header h1 {
      color: var(--primary);
      margin-bottom: var(--spacing-sm);
    }
    
    .filters-card {
      margin-bottom: var(--spacing-xl);
    }
    
    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-md);
    }
    
    .news-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
    }
    
    .news-card {
      background: var(--bg-primary);
      border: var(--border-width) solid var(--border-color);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-lg);
      transition: all var(--transition-base);
      display: flex;
      flex-direction: column;
    }
    
    .news-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-4px);
      border-color: var(--primary);
    }
    
    .news-card h3 {
      color: var(--primary);
      margin-bottom: var(--spacing-sm);
      font-size: var(--font-size-xl);
    }
    
    .news-card p {
      color: var(--text-secondary);
      flex: 1;
      margin-bottom: var(--spacing-md);
    }
    
    .news-link {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      color: var(--primary);
      font-weight: var(--font-weight-medium);
      text-decoration: none;
      margin-top: auto;
    }
    
    .news-link:hover {
      text-decoration: underline;
    }
    
    .load-more {
      display: flex;
      justify-content: center;
      margin-top: var(--spacing-xl);
    }
    
    .empty-state {
      text-align: center;
      padding: var(--spacing-2xl);
      color: var(--text-secondary);
    }
    
    @media (max-width: 768px) {
      .news-grid {
        grid-template-columns: 1fr;
      }
      
      .filters-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  template: `
  <div class="container">
      <div class="news-header">
        <h1>Noticias</h1>
        <p class="text-muted">Mantente informado sobre las últimas novedades</p>
      </div>
      
      <form [formGroup]="f" (ngSubmit)="reload()" class="card filters-card">
        <h3 style="margin-top: 0;">Filtros</h3>
        <div class="filters-grid">
          <div class="form-group">
            <label for="facultad">Facultad</label>
            <select 
              id="facultad"
              formControlName="facultad" 
              (change)="onFacultyChange($event.target.value)">
              <option value="">Todas las facultades</option>
              <option *ngFor="let fa of faculties" [value]="fa.name">
                {{fa.name}}
              </option>
      </select>
          </div>
          
          <div class="form-group">
            <label for="programa">Programa</label>
            <select 
              id="programa"
              formControlName="programa"
              [disabled]="!f.value.facultad">
              <option value="">Todos los programas</option>
              <option *ngFor="let p of programs" [value]="p">
                {{p}}
              </option>
      </select>
          </div>
        </div>
        <button class="btn" type="submit" [disabled]="loading">
          <span *ngIf="!loading">🔍 Filtrar</span>
          <span *ngIf="loading">Filtrando...</span>
        </button>
    </form>
      
      <div *ngIf="items.length === 0 && !loading" class="empty-state">
        <p>No se encontraron noticias con los filtros seleccionados.</p>
      </div>
      
      <div class="news-grid">
        <div *ngFor="let n of items" class="news-card">
      <h3>{{n.titulo}}</h3>
      <p>{{n.resumen}}</p>
          <a 
            *ngIf="n.enlaceExterno" 
            [href]="n.enlaceExterno" 
            target="_blank"
            rel="noopener noreferrer"
            class="news-link">
            <span>Leer más</span>
            <span>→</span>
          </a>
        </div>
      </div>
      
      <div class="load-more" *ngIf="items.length < total">
        <button class="btn" (click)="loadMore()" [disabled]="loading">
          <span *ngIf="!loading">Cargar más noticias</span>
          <span *ngIf="loading">Cargando...</span>
        </button>
    </div>
  </div>`
})
export class NewsListComponent implements OnInit {
  items: any[] = []; total = 0; page = 0; size = 10; loading=false;
  f = this.fb.group({ facultad: [''], programa: [''] });
  faculties:any[]=[]; programs:string[]=[];
  constructor(private api: ApiService, private fb: FormBuilder, private catalog: CatalogService) {}
  ngOnInit() { this.load(); }
  load() {
    if (this.loading) return; this.loading = true;
    const fac = this.f.value.facultad || ''; const prog = this.f.value.programa || '';
    const q = `${fac?`&facultad=${encodeURIComponent(fac)}`:''}${prog?`&programa=${encodeURIComponent(prog)}`:''}`;
    this.api.get(`/news?page=${this.page}&size=${this.size}${q}`).subscribe((res: any) => {
      this.items = this.items.concat(res.items || []);
      this.total = res.total || 0; this.loading=false;
    });
  }
  loadMore() { this.page++; this.load(); }
  reload() { this.items = []; this.page = 0; this.load(); }
  onFacultyChange(faculty:string){ this.programs=[]; this.f.patchValue({programa: ''}); if(faculty){ this.catalog.programs(faculty).subscribe((res:any)=> this.programs = res); }
    }
}
