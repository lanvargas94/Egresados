import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminCatalogsService, Faculty, Program, City } from '../services/admin-catalogs.service';
import { CatalogService } from '../services/catalog.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin-catalogs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    .catalogs-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: var(--spacing-xl);
    }

    .catalog-section {
      background: var(--bg-primary);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-xl);
      box-shadow: var(--shadow-sm);
    }

    .section-header {
      margin-bottom: var(--spacing-lg);
      padding-bottom: var(--spacing-md);
      border-bottom: 2px solid var(--border-color);
    }

    .section-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--primary);
      margin: 0 0 var(--spacing-xs) 0;
    }

    .items-list {
      max-height: 400px;
      overflow-y: auto;
      margin-bottom: var(--spacing-lg);
    }

    .item-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      background: var(--gray-50);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-sm);
    }

    .item-name {
      font-weight: var(--font-weight-medium);
      color: var(--text-primary);
    }

    .item-actions {
      display: flex;
      gap: var(--spacing-xs);
    }

    .form-card {
      background: var(--gray-50);
      padding: var(--spacing-md);
      border-radius: var(--border-radius-md);
      margin-top: var(--spacing-md);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: var(--spacing-sm);
      align-items: flex-end;
    }

    @media (max-width: 768px) {
      .catalogs-container {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `],
  template: `
    <div>
      <div style="margin-bottom: var(--spacing-xl);">
        <h1 style="margin: 0 0 var(--spacing-xs) 0; color: var(--primary);">Gestión de Catálogos</h1>
        <p class="text-muted" style="margin: 0;">Administra facultades, programas y ciudades</p>
      </div>

      <div class="catalogs-container">
        <!-- Facultades -->
        <div class="catalog-section">
          <div class="section-header">
            <h2 class="section-title">📚 Facultades</h2>
            <p class="text-muted" style="margin: 0; font-size: var(--font-size-sm);">
              Gestiona las facultades de la universidad
            </p>
          </div>

          <div class="items-list">
            <div *ngFor="let fac of faculties" class="item-card">
              <span class="item-name">{{fac.name}}</span>
            </div>
            <div *ngIf="faculties.length === 0" class="text-muted" style="text-align: center; padding: var(--spacing-md);">
              No hay facultades registradas
            </div>
          </div>

          <div class="form-card">
            <form [formGroup]="facultyForm" (ngSubmit)="addFaculty()">
              <div class="form-row">
                <div class="form-group">
                  <label for="facultyName">Nombre de Facultad</label>
                  <input 
                    id="facultyName"
                    type="text"
                    formControlName="name"
                    placeholder="Ej: Ingeniería" />
                </div>
                <button class="btn" type="submit" [disabled]="facultyForm.invalid || saving">
                  ➕ Agregar
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Programas -->
        <div class="catalog-section">
          <div class="section-header">
            <h2 class="section-title">🎓 Programas</h2>
            <p class="text-muted" style="margin: 0; font-size: var(--font-size-sm);">
              Gestiona los programas académicos
            </p>
          </div>

          <div class="form-group" style="margin-bottom: var(--spacing-md);">
            <label for="facultyFilter">Filtrar por Facultad</label>
            <select 
              id="facultyFilter"
              formControlName="facultyFilter"
              (change)="loadPrograms()">
              <option value="">Todas las facultades</option>
              <option *ngFor="let fac of faculties" [value]="fac.name">
                {{fac.name}}
              </option>
            </select>
          </div>

          <div class="items-list">
            <div *ngFor="let prog of programs" class="item-card">
              <div>
                <span class="item-name">{{prog.name}}</span>
                <small class="text-muted" style="display: block; margin-top: var(--spacing-xs);">
                  {{prog.facultyName}}
                </small>
              </div>
              <button 
                class="btn btn-sm btn-outline"
                (click)="editProgram(prog)"
                style="color: var(--primary);">
                ✏️
              </button>
            </div>
            <div *ngIf="programs.length === 0" class="text-muted" style="text-align: center; padding: var(--spacing-md);">
              No hay programas registrados
            </div>
          </div>

          <div class="form-card">
            <form [formGroup]="programForm" (ngSubmit)="addProgram()">
              <div class="form-group" style="margin-bottom: var(--spacing-md);">
                <label for="programFaculty">Facultad *</label>
                <select 
                  id="programFaculty"
                  formControlName="facultyName"
                  [attr.aria-invalid]="programForm.controls.facultyName.invalid && programForm.controls.facultyName.touched">
                  <option value="">Seleccione una facultad...</option>
                  <option *ngFor="let fac of faculties" [value]="fac.name">
                    {{fac.name}}
                  </option>
                </select>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="programName">Nombre de Programa</label>
                  <input 
                    id="programName"
                    type="text"
                    formControlName="name"
                    placeholder="Ej: Ingeniería de Sistemas" />
                </div>
                <button class="btn" type="submit" [disabled]="programForm.invalid || saving">
                  ➕ Agregar
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Ciudades -->
        <div class="catalog-section">
          <div class="section-header">
            <h2 class="section-title">🌍 Ciudades</h2>
            <p class="text-muted" style="margin: 0; font-size: var(--font-size-sm);">
              Gestiona las ciudades disponibles
            </p>
          </div>

          <div class="form-group" style="margin-bottom: var(--spacing-md);">
            <label for="countryFilter">Filtrar por País</label>
            <select 
              id="countryFilter"
              formControlName="countryFilter"
              (change)="loadCities()">
              <option value="">Todos los países</option>
              <option *ngFor="let country of countries" [value]="country.code">
                {{country.name}} ({{country.code}})
              </option>
            </select>
          </div>

          <div class="items-list">
            <div *ngFor="let city of cities" class="item-card">
              <div>
                <span class="item-name">{{city.name}}</span>
                <small class="text-muted" style="display: block; margin-top: var(--spacing-xs);">
                  {{city.countryCode}}
                </small>
              </div>
              <button 
                class="btn btn-sm btn-outline"
                (click)="editCity(city)"
                style="color: var(--primary);">
                ✏️
              </button>
            </div>
            <div *ngIf="cities.length === 0" class="text-muted" style="text-align: center; padding: var(--spacing-md);">
              No hay ciudades registradas
            </div>
          </div>

          <div class="form-card">
            <form [formGroup]="cityForm" (ngSubmit)="addCity()">
              <div class="form-group" style="margin-bottom: var(--spacing-md);">
                <label for="cityCountry">País *</label>
                <select 
                  id="cityCountry"
                  formControlName="countryCode"
                  [attr.aria-invalid]="cityForm.controls.countryCode.invalid && cityForm.controls.countryCode.touched">
                  <option value="">Seleccione un país...</option>
                  <option *ngFor="let country of countries" [value]="country.code">
                    {{country.name}} ({{country.code}})
                  </option>
                </select>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="cityName">Nombre de Ciudad</label>
                  <input 
                    id="cityName"
                    type="text"
                    formControlName="name"
                    placeholder="Ej: Neiva" />
                </div>
                <button class="btn" type="submit" [disabled]="cityForm.invalid || saving">
                  ➕ Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminCatalogsComponent implements OnInit {
  faculties: Faculty[] = [];
  programs: Program[] = [];
  cities: City[] = [];
  countries: any[] = [];
  loading = false;
  saving = false;
  editingProgram: Program | null = null;
  editingCity: City | null = null;

  facultyForm = this.fb.group({
    name: ['', Validators.required]
  });

  programForm = this.fb.group({
    facultyName: ['', Validators.required],
    name: ['', Validators.required]
  });

  cityForm = this.fb.group({
    countryCode: ['', Validators.required],
    name: ['', Validators.required]
  });

  filtersForm = this.fb.group({
    facultyFilter: [''],
    countryFilter: ['']
  });

  constructor(
    private fb: FormBuilder,
    private service: AdminCatalogsService,
    private catalog: CatalogService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadFaculties();
    this.loadPrograms();
    this.loadCountries();
    this.loadCities();
  }

  loadFaculties() {
    this.service.listFaculties().subscribe({
      next: (res) => {
        this.faculties = res.items;
      },
      error: () => {
        this.toast.error('Error al cargar facultades');
      }
    });
  }

  loadPrograms() {
    const faculty = this.filtersForm.value.facultyFilter;
    this.loading = true;
    this.service.listPrograms(faculty || undefined).subscribe({
      next: (res) => {
        this.programs = res.items;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error al cargar programas');
      }
    });
  }

  loadCities() {
    const country = this.filtersForm.value.countryFilter;
    this.loading = true;
    this.service.listCities(country || undefined).subscribe({
      next: (res) => {
        this.cities = res.items;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error al cargar ciudades');
      }
    });
  }

  loadCountries() {
    this.catalog.countries().subscribe({
      next: (countries: any) => {
        this.countries = countries as any[];
      }
    });
  }

  addFaculty() {
    if (this.facultyForm.invalid) {
      this.facultyForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.service.createFaculty(this.facultyForm.value.name!).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Facultad agregada');
        this.facultyForm.reset();
        this.loadFaculties();
      },
      error: (err) => {
        this.saving = false;
        const message = err?.error?.error || 'Error al agregar facultad';
        this.toast.error(message);
      }
    });
  }

  addProgram() {
    if (this.programForm.invalid) {
      this.programForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.service.createProgram(
      this.programForm.value.facultyName!,
      this.programForm.value.name!
    ).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Programa agregado');
        this.programForm.reset();
        this.loadPrograms();
      },
      error: (err) => {
        this.saving = false;
        const message = err?.error?.error || 'Error al agregar programa';
        this.toast.error(message);
      }
    });
  }

  addCity() {
    if (this.cityForm.invalid) {
      this.cityForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.service.createCity(
      this.cityForm.value.countryCode!,
      this.cityForm.value.name!
    ).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Ciudad agregada');
        this.cityForm.reset();
        this.loadCities();
      },
      error: (err) => {
        this.saving = false;
        const message = err?.error?.error || 'Error al agregar ciudad';
        this.toast.error(message);
      }
    });
  }

  editProgram(prog: Program) {
    const newName = prompt('Nuevo nombre del programa:', prog.name);
    if (!newName || newName.trim() === prog.name) return;

    this.saving = true;
    this.service.updateProgram(prog.id, newName.trim()).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Programa actualizado');
        this.loadPrograms();
      },
      error: (err) => {
        this.saving = false;
        const message = err?.error?.error || 'Error al actualizar programa';
        this.toast.error(message);
      }
    });
  }

  editCity(city: City) {
    const newName = prompt('Nuevo nombre de la ciudad:', city.name);
    if (!newName || newName.trim() === city.name) return;

    this.saving = true;
    this.service.updateCity(city.id, newName.trim()).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Ciudad actualizada');
        this.loadCities();
      },
      error: (err) => {
        this.saving = false;
        const message = err?.error?.error || 'Error al actualizar ciudad';
        this.toast.error(message);
      }
    });
  }
}

