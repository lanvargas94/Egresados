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
public class CatalogController {
    private final CountryRepository countries;
    private final CityRepository cities;
    private final com.corhuila.egresados.infrastructure.catalog.repo.FacultyRepository faculties;
    private final com.corhuila.egresados.infrastructure.catalog.repo.ProgramCatalogRepository programs;

    public CatalogController(CountryRepository countries, CityRepository cities,
                             com.corhuila.egresados.infrastructure.catalog.repo.FacultyRepository faculties,
                             com.corhuila.egresados.infrastructure.catalog.repo.ProgramCatalogRepository programs) {
        this.countries = countries; this.cities = cities; this.faculties = faculties; this.programs = programs;
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
        var list = cities.findAll().stream()
                .filter(c -> country.equalsIgnoreCase(c.getCountryCode()))
                .map(c -> c.getName())
                .sorted()
                .toList();
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
    public ResponseEntity<?> sectors(com.corhuila.egresados.infrastructure.catalog.repo.SectorRepository sectorRepo) {
        var list = sectorRepo.findAll().stream().filter(s -> s.isActive()).map(s -> s.getName()).sorted().toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/contract-types")
    public ResponseEntity<?> contractTypes(com.corhuila.egresados.infrastructure.catalog.repo.ContractTypeRepository repo) {
        var list = repo.findAll().stream().filter(ct -> ct.isActive()).map(ct -> ct.getName()).sorted().toList();
        return ResponseEntity.ok(list);
    }
}
