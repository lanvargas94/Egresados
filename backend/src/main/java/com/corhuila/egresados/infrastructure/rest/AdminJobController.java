package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.application.jobs.AdminJobOfferService;
import com.corhuila.egresados.domain.model.JobOffer;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/jobs")
@io.swagger.v3.oas.annotations.tags.Tag(name = "11. Administración - Ofertas", description = "Gestión de ofertas de empleo: creación, publicación, archivado y exportación de intereses")
public class AdminJobController {
    private final AdminJobOfferService service;
    private final com.corhuila.egresados.infrastructure.audit.AuditService audit;
    private final com.corhuila.egresados.domain.ports.JobOfferRepository repo;
    private final com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringJobInterestJpaRepository jobInterests;
    private final com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringGraduateJpaRepository grads;
    public AdminJobController(AdminJobOfferService service, com.corhuila.egresados.infrastructure.audit.AuditService audit,
                              com.corhuila.egresados.domain.ports.JobOfferRepository repo,
                              com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringJobInterestJpaRepository jobInterests,
                              com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringGraduateJpaRepository grads) { 
        this.service = service; 
        this.audit = audit; 
        this.repo = repo;
        this.jobInterests = jobInterests;
        this.grads = grads;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody JobOffer job) {
        try {
            job.setId(null);
            job.setEstado(JobOffer.Estado.BORRADOR);
            var saved = service.create(job);
            audit.log("CREATE","JobOffer", saved.getId().toString(), saved.getTitulo());
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error del servidor: " + ex.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody JobOffer job) {
        try {
            job.setId(id);
            var saved = service.update(job);
            audit.log("UPDATE","JobOffer", saved.getId().toString(), saved.getTitulo());
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error del servidor: " + ex.getMessage()));
        }
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<?> publish(@PathVariable UUID id) {
        try {
            var saved = service.publish(id);
            audit.log("PUBLISH","JobOffer", saved.getId().toString(), saved.getTitulo());
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error del servidor: " + ex.getMessage()));
        }
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
        try {
            var job = repo.findById(id).orElseThrow();
            String titulo = job.getTitulo();
            service.delete(id);
            audit.log("DELETE","JobOffer", id.toString(), titulo);
            return ResponseEntity.ok(java.util.Map.of("ok", true));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error al eliminar oferta: " + ex.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable UUID id) {
        return ResponseEntity.ok(repo.findById(id).orElseThrow());
    }

    @PostMapping("/{id}/expire")
    public ResponseEntity<?> expire(@PathVariable UUID id) {
        var saved = service.expire(id);
        audit.log("EXPIRE","JobOffer", saved.getId().toString(), saved.getTitulo());
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<?> close(@PathVariable UUID id) {
        var saved = service.close(id);
        audit.log("CLOSE","JobOffer", saved.getId().toString(), saved.getTitulo());
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<?> getStats(@PathVariable UUID id) {
        long interesados = jobInterests.countByJobOfferId(id);
        return ResponseEntity.ok(java.util.Map.of("interesados", interesados));
    }

    @GetMapping("/{id}/interests/export")
    public ResponseEntity<?> exportInterests(@PathVariable UUID id) {
        var list = jobInterests.findByJobOfferId(id);
        StringBuilder sb = new StringBuilder();
        // Encabezados con BOM UTF-8 para Excel
        sb.append("\uFEFF");
        sb.append("Nombre,Correo,Facultad,Programa\n");
        for (var interest : list) {
            var g = grads.findWithProgramsById(interest.getGraduateId()).orElse(null);
            if (g != null) {
                String nombre = g.getNombreLegal() == null ? "" : g.getNombreLegal().replace(","," ").replace("\n"," ").replace("\r"," ");
                String correo = g.getCorreoPersonal() == null ? "" : g.getCorreoPersonal();
                
                if (g.getProgramas() == null || g.getProgramas().isEmpty()) {
                    sb.append(nombre).append(",").append(correo).append(",").append("").append(",").append("").append("\n");
                } else {
                    for (var p : g.getProgramas()) {
                        String fac = p.getFacultad() == null ? "" : p.getFacultad().replace(","," ").replace("\n"," ").replace("\r"," ");
                        String prog = p.getPrograma() == null ? "" : p.getPrograma().replace(","," ").replace("\n"," ").replace("\r"," ");
                        sb.append(nombre).append(",").append(correo).append(",").append(fac).append(",").append(prog).append("\n");
                    }
                }
            }
        }
        return ResponseEntity.ok()
                .header("Content-Type","text/csv; charset=utf-8")
                .header("Content-Disposition","attachment; filename=interesados-"+id+".csv")
                .body(sb.toString());
    }
}
