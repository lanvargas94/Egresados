package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.infrastructure.audit.AuditService;
import com.corhuila.egresados.infrastructure.catalog.entity.ProgramCatalogEntity;
import com.corhuila.egresados.infrastructure.catalog.repo.CityRepository;
import com.corhuila.egresados.infrastructure.catalog.repo.FacultyRepository;
import com.corhuila.egresados.infrastructure.catalog.repo.ProgramCatalogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/catalogs")
public class AdminCatalogController {
    private final FacultyRepository facultyRepo;
    private final ProgramCatalogRepository programRepo;
    private final CityRepository cityRepo;
    private final AuditService auditService;

    public AdminCatalogController(
        FacultyRepository facultyRepo,
        ProgramCatalogRepository programRepo,
        CityRepository cityRepo,
        AuditService auditService
    ) {
        this.facultyRepo = facultyRepo;
        this.programRepo = programRepo;
        this.cityRepo = cityRepo;
        this.auditService = auditService;
    }

    // Gestión de Facultades
    @GetMapping("/faculties")
    public ResponseEntity<?> listFaculties() {
        return ResponseEntity.ok(Map.of("items", facultyRepo.findAll()));
    }

    @PostMapping("/faculties")
    public ResponseEntity<?> createFaculty(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nombre requerido"));
        }
        if (facultyRepo.existsById(name)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Facultad ya existe"));
        }
        var faculty = new com.corhuila.egresados.infrastructure.catalog.entity.FacultyEntity();
        faculty.setName(name);
        var saved = facultyRepo.save(faculty);
        auditService.log("CREATE", "Faculty", saved.getName(), "Facultad creada: " + name);
        return ResponseEntity.ok(saved);
    }

    // Gestión de Programas
    @GetMapping("/programs")
    public ResponseEntity<?> listPrograms(@RequestParam(required = false) String faculty) {
        if (faculty != null && !faculty.isBlank()) {
            return ResponseEntity.ok(Map.of("items", programRepo.findByFacultyNameOrderByNameAsc(faculty)));
        }
        return ResponseEntity.ok(Map.of("items", programRepo.findAll()));
    }

    @PostMapping("/programs")
    public ResponseEntity<?> createProgram(@RequestBody Map<String, String> body) {
        String facultyName = body.get("facultyName");
        String name = body.get("name");
        if (facultyName == null || facultyName.isBlank() || name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Facultad y nombre requeridos"));
        }
        if (!facultyRepo.existsById(facultyName)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Facultad no encontrada"));
        }
        // Verificar duplicidad
        var existing = programRepo.findByFacultyNameOrderByNameAsc(facultyName).stream()
                .filter(p -> p.getName().equalsIgnoreCase(name))
                .findFirst();
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Programa ya existe en esta facultad"));
        }
        var program = new ProgramCatalogEntity();
        program.setFacultyName(facultyName);
        program.setName(name);
        var saved = programRepo.save(program);
        auditService.log("CREATE", "Program", String.valueOf(saved.getId()), 
            "Programa creado: " + name + " en " + facultyName);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/programs/{id}")
    public ResponseEntity<?> updateProgram(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var program = programRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Programa no encontrado"));
        String name = body.get("name");
        if (name != null && !name.isBlank()) {
            // Verificar duplicidad
            var existing = programRepo.findByFacultyNameOrderByNameAsc(program.getFacultyName()).stream()
                    .filter(p -> p.getName().equalsIgnoreCase(name) && !p.getId().equals(id))
                    .findFirst();
            if (existing.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Programa ya existe en esta facultad"));
            }
            program.setName(name);
        }
        var saved = programRepo.save(program);
        auditService.log("UPDATE", "Program", String.valueOf(saved.getId()), "Programa actualizado");
        return ResponseEntity.ok(saved);
    }

    // Gestión de Ciudades
    @GetMapping("/cities")
    public ResponseEntity<?> listCities(@RequestParam(required = false) String countryCode) {
        if (countryCode != null && !countryCode.isBlank()) {
            var cities = cityRepo.findAll().stream()
                    .filter(c -> c.getCountryCode().equalsIgnoreCase(countryCode))
                    .toList();
            return ResponseEntity.ok(Map.of("items", cities));
        }
        return ResponseEntity.ok(Map.of("items", cityRepo.findAll()));
    }

    @PostMapping("/cities")
    public ResponseEntity<?> createCity(@RequestBody Map<String, String> body) {
        String countryCode = body.get("countryCode");
        String name = body.get("name");
        if (countryCode == null || countryCode.isBlank() || name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Código de país y nombre requeridos"));
        }
        // Verificar duplicidad
        var existing = cityRepo.findByCountryCodeAndNameIgnoreCase(countryCode.toUpperCase(), name);
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ciudad ya existe en este país"));
        }
        var city = new com.corhuila.egresados.infrastructure.catalog.entity.CityEntity();
        city.setCountryCode(countryCode.toUpperCase());
        city.setName(name);
        var saved = cityRepo.save(city);
        auditService.log("CREATE", "City", String.valueOf(saved.getId()), 
            "Ciudad creada: " + name + " en " + countryCode);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/cities/{id}")
    public ResponseEntity<?> updateCity(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var city = cityRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ciudad no encontrada"));
        String name = body.get("name");
        if (name != null && !name.isBlank()) {
            // Verificar duplicidad
            var existing = cityRepo.findByCountryCodeAndNameIgnoreCase(city.getCountryCode(), name);
            if (existing.isPresent() && !existing.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ciudad ya existe en este país"));
            }
            city.setName(name);
        }
        var saved = cityRepo.save(city);
        auditService.log("UPDATE", "City", String.valueOf(saved.getId()), "Ciudad actualizada");
        return ResponseEntity.ok(saved);
    }
}

