package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.infrastructure.catalog.repo.CityRepository;
import com.corhuila.egresados.infrastructure.catalog.repo.CountryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/catalog")
@io.swagger.v3.oas.annotations.tags.Tag(name = "05. Catálogos Públicos", description = "Consulta de catálogos maestros: países, ciudades, facultades, programas, sectores y tipos de contrato")
public class CatalogController {
    private final CountryRepository countries;
    private final CityRepository cities;
    private final com.corhuila.egresados.infrastructure.catalog.repo.FacultyRepository faculties;
    private final com.corhuila.egresados.infrastructure.catalog.repo.ProgramCatalogRepository programs;
    private final com.corhuila.egresados.infrastructure.catalog.repo.SectorRepository sectorRepo;
    private final com.corhuila.egresados.infrastructure.catalog.repo.ContractTypeRepository contractTypeRepo;

    public CatalogController(CountryRepository countries, CityRepository cities,
                             com.corhuila.egresados.infrastructure.catalog.repo.FacultyRepository faculties,
                             com.corhuila.egresados.infrastructure.catalog.repo.ProgramCatalogRepository programs,
                             com.corhuila.egresados.infrastructure.catalog.repo.SectorRepository sectorRepo,
                             com.corhuila.egresados.infrastructure.catalog.repo.ContractTypeRepository contractTypeRepo) {
        this.countries = countries; 
        this.cities = cities; 
        this.faculties = faculties; 
        this.programs = programs;
        this.sectorRepo = sectorRepo;
        this.contractTypeRepo = contractTypeRepo;
    }

    @GetMapping("/countries")
    public ResponseEntity<?> countries() {
        var list = countries.findAll().stream().map(c -> Map.of(
                "code", c.getCode(),
                "name", c.getName(),
                "dialCode", c.getDialCode()
        )).toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/cities")
    public ResponseEntity<?> cities(@RequestParam("country") String country) {
        // Log para debugging
        var allCities = cities.findAll();
        System.out.println("Total ciudades en BD: " + allCities.size());
        System.out.println("Buscando ciudades para país: " + country);
        
        var list = allCities.stream()
                .filter(c -> {
                    boolean matches = country.equalsIgnoreCase(c.getCountryCode());
                    if (matches) {
                        System.out.println("Ciudad encontrada: " + c.getName() + " (país: " + c.getCountryCode() + ")");
                    }
                    return matches;
                })
                .map(c -> c.getName())
                .sorted()
                .toList();
        
        System.out.println("Ciudades encontradas para " + country + ": " + list.size());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/faculties")
    public ResponseEntity<?> faculties() {
        var list = faculties.findAll().stream().map(f -> java.util.Map.of("name", f.getName())).toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/programs")
    public ResponseEntity<?> programs(@RequestParam("faculty") String faculty) {
        var list = programs.findByFacultyNameOrderByNameAsc(faculty).stream().map(p -> p.getName()).toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/sectors")
    public ResponseEntity<?> sectors() {
        var list = sectorRepo.findAll().stream().filter(s -> s.isActive()).map(s -> s.getName()).sorted().toList();
        return ResponseEntity.ok(java.util.Map.of("items", list));
    }

    @GetMapping("/contract-types")
    public ResponseEntity<?> contractTypes() {
        var list = contractTypeRepo.findAll().stream().filter(ct -> ct.isActive()).map(ct -> ct.getName()).sorted().toList();
        return ResponseEntity.ok(java.util.Map.of("items", list));
    }
}
