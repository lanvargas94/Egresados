import { Component, OnInit, HostListener } from '@angular/core';
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

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
      overflow-y: auto;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 100%;
      max-width: 80%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      position: relative;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem;
      border-bottom: 1px solid #e0e0e0;
      position: sticky;
      top: 0;
      background: white;
      z-index: 10;
    }

    .modal-header h2 {
      margin: 0;
      flex: 1;
      color: var(--primary, #1976d2);
      font-size: 1.5rem;
    }

    .modal-close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      color: #666;
      transition: color 0.2s;
      margin-left: 1rem;
    }

    .modal-close-btn:hover {
      color: #000;
    }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
    }

    .modal-image {
      margin-bottom: 1.5rem;
    }

    .modal-image img {
      width: 100%;
      max-height: 400px;
      object-fit: contain;
      border-radius: 4px;
    }

    .modal-summary {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .modal-summary p {
      margin: 0;
      color: #666;
      font-size: 1.1rem;
      line-height: 1.6;
    }

    .modal-content-html {
      margin-bottom: 1.5rem;
      line-height: 1.8;
    }

    .modal-content-html :deep(h1),
    .modal-content-html :deep(h2),
    .modal-content-html :deep(h3) {
      color: var(--primary, #1976d2);
      margin-top: 1.5rem;
      margin-bottom: 1rem;
    }

    .modal-content-html :deep(p) {
      margin-bottom: 1rem;
    }

    .modal-content-html :deep(ul),
    .modal-content-html :deep(ol) {
      margin-left: 1.5rem;
      margin-bottom: 1rem;
    }

    .modal-content-html :deep(a) {
      color: var(--primary, #1976d2);
      text-decoration: underline;
    }

    .modal-attachment,
    .modal-external-link {
      margin-bottom: 1.5rem;
    }

    .modal-date {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
      color: #999;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      position: sticky;
      bottom: 0;
      background: white;
    }
    
    @media (max-width: 768px) {
      .news-grid {
        grid-template-columns: 1fr;
      }
      
      .filters-grid {
        grid-template-columns: 1fr;
      }

      .modal-content {
        max-width: 100%;
        max-height: 100vh;
        border-radius: 0;
        margin: 0;
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding: 1rem;
      }

      .modal-header h2 {
        font-size: 1.25rem;
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
      
      <div *ngIf="items.length === 0 && !loading" class="card" style="text-align: center; padding: 2rem;">
        <p>No hay noticias disponibles para el estado seleccionado.</p>
      </div>
      
      <div class="news-grid">
        <div *ngFor="let n of items" class="news-card" (click)="openModal(n.id)" style="cursor: pointer;">
          <h3>{{n.titulo}}</h3>
          <p>{{n.resumen}}</p>
          <div style="margin-top: auto; display: flex; flex-direction: column; gap: 0.5rem;">
            <small *ngIf="n.fechaPublicacion" style="color: #999; margin-top: 0.5rem;">
              Publicado: {{formatDate(n.fechaPublicacion)}}
            </small>
            <span class="news-link" style="margin-top: 0.5rem;">
              <span>Ver más →</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div *ngIf="selectedNews" class="modal-overlay" (click)="closeModal()" (keydown.esc)="closeModal()" tabindex="0">
        <div class="modal-content" (click)="$event.stopPropagation()" tabindex="0" (keydown.esc)="closeModal()">
          <div class="modal-header">
            <h2>{{selectedNews.titulo}}</h2>
            <button class="modal-close-btn" (click)="closeModal()" aria-label="Cerrar modal">
              <span>❌</span>
            </button>
          </div>
          
          <div class="modal-body">
            <!-- Imagen -->
            <div *ngIf="selectedNews.imagenUrl" class="modal-image">
              <img [src]="'/api/news/' + selectedNews.id + '/image'" [alt]="selectedNews.titulo" (error)="$event.target.style.display='none'" />
            </div>
            
            <!-- Resumen -->
            <div *ngIf="selectedNews.resumen" class="modal-summary">
              <p>{{selectedNews.resumen}}</p>
            </div>
            
            <!-- Contenido HTML -->
            <div *ngIf="selectedNews.cuerpoHtml" class="modal-content-html" [innerHTML]="selectedNews.cuerpoHtml"></div>
            
            <!-- Adjunto -->
            <div *ngIf="selectedNews.adjuntoUrl" class="modal-attachment">
              <a [href]="'/api/news/' + selectedNews.id + '/attachment'" target="_blank" rel="noopener noreferrer" class="btn" style="background: #4caf50; color: white; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem;">
                <span>📎</span>
                <span>Descargar adjunto</span>
              </a>
            </div>
            
            <!-- Enlace externo -->
            <div *ngIf="selectedNews.enlaceExterno" class="modal-external-link">
              <a [href]="selectedNews.enlaceExterno" target="_blank" rel="noopener noreferrer" class="btn" style="background: #2196F3; color: white; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem;">
                <span>🔗</span>
                <span>Ver enlace externo</span>
              </a>
            </div>
            
            <!-- Fecha de publicación -->
            <div *ngIf="selectedNews.fechaPublicacion" class="modal-date">
              <small>Publicado el: {{formatDate(selectedNews.fechaPublicacion)}}</small>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn" (click)="closeModal()">Cerrar</button>
          </div>
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
  selectedNews: any = null;
  loadingNews = false;

  constructor(private api: ApiService, private fb: FormBuilder, private catalog: CatalogService) {}

  ngOnInit() { 
    this.load(); 
    this.catalog.faculties().subscribe((res: any) => this.faculties = res || []);
  }

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
  
  onFacultyChange(faculty:string){ 
    this.programs=[]; 
    this.f.patchValue({programa: ''}); 
    if(faculty){ 
      this.catalog.programs(faculty).subscribe((res:any)=> this.programs = res || []); 
    }
  }
  
  openModal(newsId: string) {
    this.loadingNews = true;
    this.api.get(`/news/${newsId}`).subscribe({
      next: (news: any) => {
        this.selectedNews = news;
        this.loadingNews = false;
        // Prevenir scroll del body cuando el modal está abierto
        document.body.style.overflow = 'hidden';
        // Hacer foco en el modal para accesibilidad
        setTimeout(() => {
          const modal = document.querySelector('.modal-content');
          if (modal) {
            (modal as HTMLElement).focus();
          }
        }, 100);
      },
      error: () => {
        this.loadingNews = false;
        alert('Error al cargar la noticia');
      }
    });
  }

  closeModal() {
    this.selectedNews = null;
    // Restaurar scroll del body
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    if (this.selectedNews) {
      this.closeModal();
    }
  }
  
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  }
}
