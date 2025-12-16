package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.infrastructure.audit.AuditService;
import com.corhuila.egresados.infrastructure.catalog.entity.SectorEntity;
import com.corhuila.egresados.infrastructure.catalog.repo.SectorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/sectors")
@io.swagger.v3.oas.annotations.tags.Tag(name = "15. Administración - Catálogos", description = "Gestión de catálogos maestros: facultades, programas, ciudades, sectores y tipos de contrato")
public class AdminSectorController {
    private final SectorRepository repo;
    private final AuditService audit;

    public AdminSectorController(SectorRepository repo, AuditService audit) { this.repo = repo; this.audit = audit; }

    @GetMapping
    public ResponseEntity<?> list() { return ResponseEntity.ok(repo.findAll()); }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody SectorEntity s) {
        s.setId(null); s.setActive(true); var saved = repo.save(s);
        audit.log("CREATE","Sector", String.valueOf(saved.getId()), saved.getName());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody SectorEntity s) {
        s.setId(id); var saved = repo.save(s);
        audit.log("UPDATE","Sector", String.valueOf(saved.getId()), saved.getName());
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable Long id) {
        var s = repo.findById(id).orElseThrow(); s.setActive(false); var saved = repo.save(s);
        audit.log("DEACTIVATE","Sector", String.valueOf(saved.getId()), saved.getName());
        return ResponseEntity.ok(Map.of("ok", true));
    }
}

