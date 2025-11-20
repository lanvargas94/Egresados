import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AdminReportsService } from '../services/admin-reports.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    .reports-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: var(--spacing-xl);
      margin-bottom: var(--spacing-xl);
    }

    .chart-card {
      background: var(--bg-primary);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-xl);
      box-shadow: var(--shadow-sm);
    }

    .chart-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--primary);
      margin: 0 0 var(--spacing-lg) 0;
    }

    .chart-container {
      position: relative;
      height: 300px;
      margin-bottom: var(--spacing-md);
    }

    .export-section {
      background: var(--bg-primary);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-xl);
      box-shadow: var(--shadow-sm);
    }

    .fields-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: var(--spacing-sm);
      margin: var(--spacing-md) 0;
    }

    .field-checkbox {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md);
      margin: var(--spacing-md) 0;
    }

    @media (max-width: 768px) {
      .reports-container {
        grid-template-columns: 1fr;
      }

      .fields-grid,
      .filters-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  template: `
      <div>
      <div style="margin-bottom: var(--spacing-xl);">
        <h1 style="margin: 0 0 var(--spacing-xs) 0; color: var(--primary);">Reportes y Estadísticas</h1>
        <p class="text-muted" style="margin: 0;">Visualiza estadísticas y exporta datos de egresados</p>
      </div>

      <div class="reports-container" *ngIf="!loadingCharts">
        <div class="chart-card">
          <h2 class="chart-title">📊 Egresados por Programa</h2>
          <div class="chart-container">
            <canvas #programChart></canvas>
          </div>
        </div>

        <div class="chart-card">
          <h2 class="chart-title">📅 Egresados por Año</h2>
          <div class="chart-container">
            <canvas #yearChart></canvas>
          </div>
        </div>

        <div class="chart-card">
          <h2 class="chart-title">✅ Egresados por Estado</h2>
          <div class="chart-container">
            <canvas #statusChart></canvas>
          </div>
        </div>

        <div class="chart-card">
          <h2 class="chart-title">📅 Registros en Eventos</h2>
          <div class="chart-container">
            <canvas #eventsChart></canvas>
          </div>
        </div>
      </div>

      <div *ngIf="loadingCharts" class="loading-spinner" style="display: flex; justify-content: center; padding: var(--spacing-2xl);">
        <div class="loading"></div>
      </div>

      <div class="export-section">
        <h2 style="margin-top: 0; color: var(--primary);">📥 Exportar Datos</h2>
        <form [formGroup]="f" (ngSubmit)="export()">
          <div class="form-group">
            <label>Campos a Exportar</label>
            <div class="fields-grid">
              <div class="field-checkbox" *ngFor="let c of allFields">
                <input 
                  type="checkbox" 
                  [value]="c" 
                  [checked]="selectedFields.includes(c)"
                  (change)="toggleField($event)" />
                <label style="margin: 0; cursor: pointer;">{{c}}</label>
              </div>
            </div>
          </div>

          <h3 style="margin-top: var(--spacing-xl);">Filtros</h3>
          <div class="filters-grid">
            <div class="form-group">
              <label for="facultad">Facultad</label>
              <input id="facultad" formControlName="facultad" />
            </div>
            <div class="form-group">
              <label for="programa">Programa</label>
              <input id="programa" formControlName="programa" />
            </div>
            <div class="form-group">
              <label for="anio">Año</label>
              <input id="anio" type="number" formControlName="anio" />
            </div>
            <div class="form-group">
              <label for="pais">País</label>
              <input id="pais" formControlName="pais" />
            </div>
            <div class="form-group">
              <label for="ciudad">Ciudad</label>
              <input id="ciudad" formControlName="ciudad" />
            </div>
            <div class="form-group">
              <label for="sector">Sector</label>
              <input id="sector" formControlName="sector" />
            </div>
            <div class="form-group">
              <label for="situacion">Situación</label>
              <input id="situacion" formControlName="situacion" />
            </div>
            <div class="form-group">
              <label for="updatedFrom">Actualizado desde</label>
              <input id="updatedFrom" type="datetime-local" formControlName="updatedFrom" />
            </div>
            <div class="form-group">
              <label for="updatedTo">Actualizado hasta</label>
              <input id="updatedTo" type="datetime-local" formControlName="updatedTo" />
            </div>
            <div class="form-group">
              <label for="format">Formato</label>
              <select id="format" formControlName="format">
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="justification">Justificación (si exportas > 5000 sin filtros)</label>
            <textarea 
              id="justification"
              formControlName="justification"
              rows="3"
              placeholder="Explica por qué necesitas exportar más de 5000 registros..."></textarea>
          </div>

          <button class="btn" type="submit" [disabled]="exporting">
            <span *ngIf="!exporting">📥 Exportar</span>
            <span *ngIf="exporting">Exportando...</span>
          </button>
    </form>
      </div>
  </div>
  `
})
export class AdminReportsComponent implements OnInit, AfterViewInit {
  @ViewChild('programChart') programChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('yearChart') yearChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('eventsChart') eventsChartRef!: ElementRef<HTMLCanvasElement>;

  allFields = ['identificacion','nombre','correo','pais','ciudad','telefono','situacion','industria','empresa','cargo','consentimiento','onboarding','actualizado','facultad','programa','anio'];
  selectedFields: string[] = ['identificacion','nombre','correo'];
  loadingCharts = false;
  exporting = false;
  
  f = this.fb.group({ 
    facultad:[''], 
    programa:[''], 
    anio:[null], 
    pais:[''], 
    ciudad:[''], 
    sector:[''], 
    situacion:[''], 
    updatedFrom:[''], 
    updatedTo:[''], 
    justification:[''], 
    format:['csv']
  });

  constructor(
    private fb: FormBuilder, 
    private api: ApiService,
    private reportsService: AdminReportsService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadCharts();
  }

  ngAfterViewInit() {
    // Los gráficos se cargarán después de que las vistas estén inicializadas
  }

  loadCharts() {
    this.loadingCharts = true;
    
    Promise.all([
      this.reportsService.reportGraduatesByProgram().toPromise(),
      this.reportsService.reportGraduatesByYear().toPromise(),
      this.reportsService.reportGraduatesByStatus().toPromise(),
      this.reportsService.reportEventRegistrations().toPromise()
    ]).then(([programs, years, statuses, events]) => {
      setTimeout(() => {
        this.renderProgramChart(programs?.items || []);
        this.renderYearChart(years?.items || []);
        this.renderStatusChart(statuses?.items || []);
        this.renderEventsChart(events?.items || []);
        this.loadingCharts = false;
      }, 100);
    }).catch(() => {
      this.loadingCharts = false;
      this.toast.error('Error al cargar estadísticas');
    });
  }

  renderProgramChart(data: any[]) {
    if (!this.programChartRef) return;
    const ctx = this.programChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Usar gráfico simple con HTML5 Canvas sin Chart.js
    this.renderSimpleBarChart(ctx, data.slice(0, 10).map((d: any) => ({
      label: d.programa || 'Sin programa',
      value: d.total || 0
    })), 'Egresados por Programa');
  }

  renderYearChart(data: any[]) {
    if (!this.yearChartRef) return;
    const ctx = this.yearChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.renderSimpleBarChart(ctx, data.map((d: any) => ({
      label: String(d.anio || 'Sin año'),
      value: d.total || 0
    })), 'Egresados por Año');
  }

  renderStatusChart(data: any[]) {
    if (!this.statusChartRef) return;
    const ctx = this.statusChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.renderSimplePieChart(ctx, data.map((d: any) => ({
      label: d.estado || 'Sin estado',
      value: d.total || 0
    })));
  }

  renderEventsChart(data: any[]) {
    if (!this.eventsChartRef) return;
    const ctx = this.eventsChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.renderSimpleBarChart(ctx, data.slice(0, 10).map((d: any) => ({
      label: (d.eventoNombre || 'Sin nombre').substring(0, 20),
      value: d.inscritos || 0
    })), 'Registros en Eventos');
  }

  renderSimpleBarChart(ctx: CanvasRenderingContext2D, data: Array<{label: string, value: number}>, title: string) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding - 30;
    
    ctx.clearRect(0, 0, width, height);
    
    // Título
    ctx.fillStyle = '#212121';
    ctx.font = 'bold 14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(title, width / 2, 20);
    
    if (data.length === 0) {
      ctx.fillStyle = '#9e9e9e';
      ctx.fillText('No hay datos disponibles', width / 2, height / 2);
      return;
    }
    
    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = chartWidth / data.length * 0.8;
    const spacing = chartWidth / data.length * 0.2;
    
    // Ejes
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding - 30);
    ctx.lineTo(width - padding, height - padding - 30);
    ctx.stroke();
    
    // Barras
    data.forEach((item, i) => {
      const x = padding + i * (barWidth + spacing) + spacing / 2;
      const barHeight = (item.value / maxValue) * chartHeight;
      const y = height - padding - 30 - barHeight;
      
      ctx.fillStyle = `hsl(${(i * 360) / data.length}, 70%, 50%)`;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Valor
      ctx.fillStyle = '#212121';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(String(item.value), x + barWidth / 2, y - 5);
      
      // Label
      ctx.fillStyle = '#616161';
      ctx.font = '10px Inter';
      ctx.save();
      ctx.translate(x + barWidth / 2, height - padding - 15);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(item.label.substring(0, 15), 0, 0);
      ctx.restore();
    });
  }

  renderSimplePieChart(ctx: CanvasRenderingContext2D, data: Array<{label: string, value: number}>) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2 - 15;
    const radius = Math.min(width, height) / 2 - 60;
    
    ctx.clearRect(0, 0, width, height);
    
    // Título
    ctx.fillStyle = '#212121';
    ctx.font = 'bold 14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Egresados por Estado', width / 2, 20);
    
    if (data.length === 0) {
      ctx.fillStyle = '#9e9e9e';
      ctx.fillText('No hay datos disponibles', width / 2, height / 2);
      return;
    }
    
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return;
    
    let currentAngle = -Math.PI / 2;
    
    // Dibujar rebanadas
    data.forEach((item, i) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      
      ctx.fillStyle = `hsl(${(i * 360) / data.length}, 70%, 50%)`;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Etiquetas
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
      
      ctx.fillStyle = '#212121';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(String(item.value), labelX, labelY);
      
      // Leyenda
      const legendY = height - 40 + i * 20;
      ctx.fillRect(20, legendY - 10, 15, 15);
      ctx.fillStyle = '#212121';
      ctx.font = '11px Inter';
      ctx.textAlign = 'left';
      ctx.fillText(`${item.label} (${item.value})`, 40, legendY);
      
      currentAngle += sliceAngle;
    });
  }

  toggleField(ev: any) {
    const val = ev.target.value;
    if (ev.target.checked) {
      if (!this.selectedFields.includes(val)) {
        this.selectedFields.push(val);
      }
    } else {
      this.selectedFields = this.selectedFields.filter(f => f !== val);
    }
  }

  export() {
    const v = this.f.value as any;
    const fmt = v.format || 'csv';
    const body: any = {
      fields: this.selectedFields,
      facultad: v.facultad || null,
      programa: v.programa || null,
      anio: v.anio || null,
      pais: v.pais || null,
      ciudad: v.ciudad || null,
      sector: v.sector || null,
      situacion: v.situacion || null,
      updatedFrom: v.updatedFrom ? new Date(v.updatedFrom as string).toISOString() : null,
      updatedTo: v.updatedTo ? new Date(v.updatedTo as string).toISOString() : null,
      justification: v.justification || null,
      format: fmt
    };

    this.exporting = true;
    const opts: any = { observe: 'response' as any };
    if (fmt === 'csv') {
      opts.responseType = 'text' as any;
    } else {
      opts.responseType = 'blob' as any;
    }

    this.api.post('/admin/reports/export', body, opts).subscribe({
      next: (res: any) => {
        this.exporting = false;
        const isCsv = fmt === 'csv';
      const blob = isCsv ? new Blob([res.body], { type: 'text/csv;charset=utf-8;' }) : res.body;
      const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = isCsv ? 'export-egresados.csv' : 'export-egresados.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.success('Exportación completada');
      },
      error: () => {
        this.exporting = false;
        this.toast.error('Error al exportar datos');
      }
    });
  }
}
