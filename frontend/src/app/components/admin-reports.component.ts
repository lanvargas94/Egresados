import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AdminReportsService } from '../services/admin-reports.service';
import { ToastService } from '../services/toast.service';
import { firstValueFrom } from 'rxjs';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    .reports-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 2rem;
      margin-bottom: var(--spacing-xl);
    }

    .chart-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 16px;
      padding: 1.75rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .chart-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #1976d2, #42a5f5);
      opacity: 0.8;
    }

    .chart-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08);
    }

    .chart-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 1.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      letter-spacing: -0.02em;
    }

    .chart-container {
      position: relative;
      height: 320px;
      margin-bottom: var(--spacing-md);
      background: #ffffff;
      border-radius: 12px;
      padding: 1rem;
    }

    .no-data-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #666;
      text-align: center;
      padding: var(--spacing-xl);
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      border-radius: 12px;
    }

    .no-data-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.4;
      filter: grayscale(0.3);
    }

    .no-data-text {
      font-size: 1.05rem;
      color: #6c757d;
      font-weight: 500;
      letter-spacing: 0.01em;
    }

    .chart-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #666;
      font-size: 1rem;
    }

    .chart-loading::after {
      content: '...';
      animation: dots 1.5s steps(4, end) infinite;
    }

    @keyframes dots {
      0%, 20% { content: '.'; }
      40% { content: '..'; }
      60%, 100% { content: '...'; }
    }

    @media (max-width: 768px) {
      .reports-container {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .chart-card {
        padding: 1.25rem;
      }

      .chart-container {
        height: 280px;
      }
    }
  `],
  template: `
      <div>
      <div style="margin-bottom: var(--spacing-xl);">
        <h1 style="margin: 0 0 var(--spacing-xs) 0; color: var(--primary);">Reportes y Estadísticas</h1>
        <p class="text-muted" style="margin: 0;">Visualiza estadísticas de egresados</p>
      </div>

      <div class="reports-container">
        <!-- Egresados por Programa -->
        <div class="chart-card">
          <h2 class="chart-title">📊 Egresados por Programa</h2>
          <div class="chart-container">
            <div *ngIf="chartStates.program === 'loading'" class="chart-loading">
              <span>Cargando...</span>
            </div>
            <div *ngIf="chartStates.program === 'noData'" class="no-data-message">
              <div class="no-data-icon">📊</div>
              <div class="no-data-text">No hay información disponible para este reporte.</div>
            </div>
            <canvas #programChart *ngIf="chartStates.program === 'hasData'"></canvas>
          </div>
        </div>

        <!-- Egresados por Año -->
        <div class="chart-card">
          <h2 class="chart-title">📅 Egresados por Año</h2>
          <div class="chart-container">
            <div *ngIf="chartStates.year === 'loading'" class="chart-loading">
              <span>Cargando...</span>
            </div>
            <div *ngIf="chartStates.year === 'noData'" class="no-data-message">
              <div class="no-data-icon">📅</div>
              <div class="no-data-text">No hay información disponible para este reporte.</div>
            </div>
            <canvas #yearChart *ngIf="chartStates.year === 'hasData'"></canvas>
          </div>
        </div>

        <!-- Egresados por Estado -->
        <div class="chart-card">
          <h2 class="chart-title">✅ Egresados por Estado</h2>
          <div class="chart-container">
            <div *ngIf="chartStates.status === 'loading'" class="chart-loading">
              <span>Cargando...</span>
            </div>
            <div *ngIf="chartStates.status === 'noData'" class="no-data-message">
              <div class="no-data-icon">✅</div>
              <div class="no-data-text">No hay información disponible para este reporte.</div>
            </div>
            <canvas #statusChart *ngIf="chartStates.status === 'hasData'"></canvas>
          </div>
        </div>

        <!-- Registros en Eventos -->
        <div class="chart-card">
          <h2 class="chart-title">📅 Registros en Eventos</h2>
          <div class="chart-container">
            <div *ngIf="chartStates.events === 'loading'" class="chart-loading">
              <span>Cargando...</span>
            </div>
            <div *ngIf="chartStates.events === 'noData'" class="no-data-message">
              <div class="no-data-icon">📅</div>
              <div class="no-data-text">No hay información disponible para este reporte.</div>
            </div>
            <canvas #eventsChart *ngIf="chartStates.events === 'hasData'"></canvas>
          </div>
        </div>
      </div>
  </div>
  `
})
export class AdminReportsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('programChart') programChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('yearChart') yearChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('eventsChart') eventsChartRef!: ElementRef<HTMLCanvasElement>;

  chartStates = {
    program: 'loading' as 'loading' | 'hasData' | 'noData',
    year: 'loading' as 'loading' | 'hasData' | 'noData',
    status: 'loading' as 'loading' | 'hasData' | 'noData',
    events: 'loading' as 'loading' | 'hasData' | 'noData'
  };
  
  private programChart: Chart | null = null;
  private yearChart: Chart | null = null;
  private statusChart: Chart | null = null;
  private eventsChart: Chart | null = null;

  constructor(
    private fb: FormBuilder, 
    private api: ApiService,
    private reportsService: AdminReportsService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    // No cargar aquí, esperar a que las vistas estén listas
  }

  ngAfterViewInit() {
    // Cargar gráficos después de que las vistas estén inicializadas
    setTimeout(() => {
      this.loadCharts();
    }, 100);
  }

  async loadCharts() {
    // Cargar cada gráfica de forma independiente para que un error no afecte a las demás
    this.loadProgramChart();
    this.loadYearChart();
    this.loadStatusChart();
    this.loadEventsChart();
  }

  async loadProgramChart() {
    try {
      const response = await firstValueFrom(this.reportsService.reportGraduatesByProgram());
      const data = response?.items || [];
      
      if (data.length === 0 || data.every((d: any) => !d.total || d.total === 0)) {
        this.chartStates.program = 'noData';
        return;
      }
      
      this.chartStates.program = 'hasData';
      setTimeout(() => {
        this.renderProgramChart(data);
      }, 100);
    } catch (error: any) {
      console.error('Error al cargar gráfica de programas:', error);
      this.chartStates.program = 'noData';
    }
  }

  async loadYearChart() {
    try {
      const response = await firstValueFrom(this.reportsService.reportGraduatesByYear());
      const data = response?.items || [];
      
      if (data.length === 0 || data.every((d: any) => !d.total || d.total === 0)) {
        this.chartStates.year = 'noData';
        return;
      }
      
      this.chartStates.year = 'hasData';
      setTimeout(() => {
        this.renderYearChart(data);
      }, 100);
    } catch (error: any) {
      console.error('Error al cargar gráfica de años:', error);
      this.chartStates.year = 'noData';
    }
  }

  async loadStatusChart() {
    try {
      const response = await firstValueFrom(this.reportsService.reportGraduatesByStatus());
      const data = response?.items || [];
      
      if (data.length === 0 || data.every((d: any) => !d.total || d.total === 0)) {
        this.chartStates.status = 'noData';
        return;
      }
      
      this.chartStates.status = 'hasData';
      setTimeout(() => {
        this.renderStatusChart(data);
      }, 100);
    } catch (error: any) {
      console.error('Error al cargar gráfica de estados:', error);
      this.chartStates.status = 'noData';
    }
  }

  async loadEventsChart() {
    try {
      const response = await firstValueFrom(this.reportsService.reportEventRegistrations());
      const data = response?.items || [];
      
      if (data.length === 0 || data.every((d: any) => !d.inscritos || d.inscritos === 0)) {
        this.chartStates.events = 'noData';
        return;
      }
      
      this.chartStates.events = 'hasData';
      setTimeout(() => {
        this.renderEventsChart(data);
      }, 100);
    } catch (error: any) {
      console.error('Error al cargar gráfica de eventos:', error);
      this.chartStates.events = 'noData';
    }
  }

  ngOnDestroy() {
    if (this.programChart) this.programChart.destroy();
    if (this.yearChart) this.yearChart.destroy();
    if (this.statusChart) this.statusChart.destroy();
    if (this.eventsChart) this.eventsChart.destroy();
  }

  renderProgramChart(data: any[]) {
    if (!this.programChartRef?.nativeElement) {
      return;
    }
    const ctx = this.programChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      return;
    }

    // Agrupar por programa (sumar totales si hay múltiples años)
    const programMap = new Map<string, number>();
    data.forEach((d: any) => {
      const programa = d.programa || 'Sin programa';
      const total = (d.total || 0) as number;
      programMap.set(programa, (programMap.get(programa) || 0) + total);
    });

    const sortedPrograms = Array.from(programMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15); // Top 15 programas

    const labels = sortedPrograms.map(p => p[0]);
    const values = sortedPrograms.map(p => p[1]);

    if (labels.length === 0 || values.length === 0) {
      this.chartStates.program = 'noData';
      return;
    }

    if (this.programChart) {
      this.programChart.destroy();
    }

    // Generar colores con gradiente para cada barra
    const generateGradient = (ctx: CanvasRenderingContext2D, color1: string, color2: string) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      return gradient;
    };

    const backgroundColors = labels.map((_, i) => {
      const gradient = generateGradient(ctx, 'rgba(25, 118, 210, 0.8)', 'rgba(25, 118, 210, 0.4)');
      return gradient;
    });

    this.programChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Egresados',
          data: values,
          backgroundColor: 'rgba(25, 118, 210, 0.8)',
          borderColor: 'rgba(25, 118, 210, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1200,
          easing: 'easeInOutQuart'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: () => '',
              label: (context) => `${context.parsed.y} egresado${context.parsed.y !== 1 ? 's' : ''}`,
              afterLabel: (context) => `Programa: ${context.label}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              stepSize: 1,
              font: {
                size: 11
              },
              color: '#6c757d',
              padding: 8
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              font: {
                size: 11
              },
              color: '#6c757d',
              padding: 10
            }
          }
        }
      }
    });
  }

  renderYearChart(data: any[]) {
    if (!this.yearChartRef?.nativeElement) {
      return;
    }
    const ctx = this.yearChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      return;
    }

    // Ordenar por año descendente
    const sortedData = [...data].sort((a: any, b: any) => {
      const yearA = a.anio || 0;
      const yearB = b.anio || 0;
      return yearB - yearA;
    });

    const labels = sortedData.map((d: any) => String(d.anio || 'Sin año'));
    const values = sortedData.map((d: any) => d.total || 0);

    if (labels.length === 0 || values.length === 0) {
      this.chartStates.year = 'noData';
      return;
    }

    if (this.yearChart) {
      this.yearChart.destroy();
    }

    this.yearChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Egresados',
          data: values,
          backgroundColor: 'rgba(76, 175, 80, 0.8)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1200,
          easing: 'easeInOutQuart'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: () => '',
              label: (context) => `${context.parsed.y} egresado${context.parsed.y !== 1 ? 's' : ''}`,
              afterLabel: (context) => `Año: ${context.label}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              stepSize: 1,
              font: {
                size: 11
              },
              color: '#6c757d',
              padding: 8
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              },
              color: '#6c757d',
              padding: 10
            }
          }
        }
      }
    });
  }

  renderStatusChart(data: any[]) {
    if (!this.statusChartRef?.nativeElement) {
      return;
    }
    const ctx = this.statusChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      return;
    }

    const labels = data.map((d: any) => d.estado || 'Sin estado');
    const values = data.map((d: any) => d.total || 0);

    if (labels.length === 0 || values.length === 0) {
      this.chartStates.status = 'noData';
      return;
    }

    if (this.statusChart) {
      this.statusChart.destroy();
    }

    // Colores mejorados para estados
    const statusColors = [
      { bg: 'rgba(255, 152, 0, 0.85)', border: 'rgba(255, 152, 0, 1)' }, // ACTIVO - Naranja
      { bg: 'rgba(156, 39, 176, 0.85)', border: 'rgba(156, 39, 176, 1)' }, // INACTIVO - Morado
      { bg: 'rgba(244, 67, 54, 0.85)', border: 'rgba(244, 67, 54, 1)' }, // Otro - Rojo
      { bg: 'rgba(33, 150, 243, 0.85)', border: 'rgba(33, 150, 243, 1)' }, // Azul
      { bg: 'rgba(76, 175, 80, 0.85)', border: 'rgba(76, 175, 80, 1)' }  // Verde
    ];

    this.statusChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Egresados',
          data: values,
          backgroundColor: labels.map((_, i) => statusColors[i % statusColors.length].bg),
          borderColor: labels.map((_, i) => statusColors[i % statusColors.length].border),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1200,
          easing: 'easeInOutQuart'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              title: () => '',
              label: (context) => `${context.parsed.y} egresado${context.parsed.y !== 1 ? 's' : ''}`,
              afterLabel: (context) => `Estado: ${context.label}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              stepSize: 1,
              font: {
                size: 11
              },
              color: '#6c757d',
              padding: 8
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              },
              color: '#6c757d',
              padding: 10
            }
          }
        }
      }
    });
  }

  renderEventsChart(data: any[]) {
    if (!this.eventsChartRef?.nativeElement) {
      return;
    }
    const ctx = this.eventsChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      return;
    }

    // Los datos ya vienen filtrados por año actual desde el backend
    // Ordenar por número de inscritos descendente y tomar los primeros 15
    const sortedEvents = [...data]
      .sort((a: any, b: any) => (b.inscritos || 0) - (a.inscritos || 0))
      .slice(0, 15);

    const labels = sortedEvents.map((d: any) => {
      const nombre = d.eventoNombre || 'Sin nombre';
      return nombre.length > 25 ? nombre.substring(0, 22) + '...' : nombre;
    });
    const values = sortedEvents.map((d: any) => d.inscritos || 0);

    if (labels.length === 0 || values.length === 0) {
      this.chartStates.events = 'noData';
      return;
    }

    if (this.eventsChart) {
      this.eventsChart.destroy();
    }

    this.eventsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Inscritos',
          data: values,
          backgroundColor: 'rgba(156, 39, 176, 0.8)',
          borderColor: 'rgba(156, 39, 176, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1200,
          easing: 'easeInOutQuart'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: () => '',
              label: (context) => `${context.parsed.y} inscrito${context.parsed.y !== 1 ? 's' : ''}`,
              afterLabel: (context) => `Evento: ${context.label}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              stepSize: 1,
              font: {
                size: 11
              },
              color: '#6c757d',
              padding: 8
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              font: {
                size: 11
              },
              color: '#6c757d',
              padding: 10
            }
          }
        }
      }
    });
  }


}
