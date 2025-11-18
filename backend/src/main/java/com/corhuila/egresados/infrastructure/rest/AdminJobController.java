package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.application.jobs.AdminJobOfferService;
import com.corhuila.egresados.domain.model.JobOffer;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/jobs")
public class AdminJobController {
    private final AdminJobOfferService service;
    private final com.corhuila.egresados.infrastructure.audit.AuditService audit;
    private final com.corhuila.egresados.domain.ports.JobOfferRepository repo;
    public AdminJobController(AdminJobOfferService service, com.corhuila.egresados.infrastructure.audit.AuditService audit,
                              com.corhuila.egresados.domain.ports.JobOfferRepository repo) { this.service = service; this.audit = audit; this.repo = repo; }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody JobOffer job) {
        job.setId(null);
        job.setEstado(JobOffer.Estado.BORRADOR);
        var saved = service.create(job);
        audit.log("CREATE","JobOffer", saved.getId().toString(), saved.getTitulo());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody JobOffer job) {
        job.setId(id);
        var saved = service.update(job);
        audit.log("UPDATE","JobOffer", saved.getId().toString(), saved.getTitulo());
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<?> publish(@PathVariable UUID id) {
        var saved = service.publish(id);
        audit.log("PUBLISH","JobOffer", saved.getId().toString(), saved.getTitulo());
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<?> archive(@PathVariable UUID id) {
        var saved = service.archive(id);
        audit.log("ARCHIVE","JobOffer", saved.getId().toString(), saved.getTitulo());
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "10") int size,
                                  @RequestParam(required = false) String estado) {
        var pg = repo.adminList(estado, page, size);
        return ResponseEntity.ok(java.util.Map.of("items", pg.getItems(), "total", pg.getTotal(), "page", pg.getPage(), "size", pg.getSize()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        // Soft delete vía estado ARCHIVADA
        var saved = service.archive(id);
        audit.log("DELETE","JobOffer", saved.getId().toString(), saved.getTitulo());
        return ResponseEntity.ok(java.util.Map.of("ok", true));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable UUID id) {
        return ResponseEntity.ok(repo.findById(id).orElseThrow());
    }
}
