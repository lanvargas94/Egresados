package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.domain.ports.JobOfferRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/jobs")
@io.swagger.v3.oas.annotations.tags.Tag(name = "07. Ofertas de Empleo", description = "Búsqueda de ofertas de empleo y gestión de interés por parte de egresados")
public class JobPublicController {
    private final JobOfferRepository repo;
    private final com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringJobInterestJpaRepository jobInterests;
    public JobPublicController(JobOfferRepository repo, 
                               com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringJobInterestJpaRepository jobInterests) { 
        this.repo = repo; 
        this.jobInterests = jobInterests;
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required = false) String estado,
                                  @RequestParam(required = false) String sector,
                                  @RequestParam(required = false) String empresa,
                                  @RequestParam(name = "tipoContrato", required = false) String tipoContrato,
                                  @RequestParam(required = false) String search,
                                  @RequestParam(required = false) LocalDate fromDate,
                                  @RequestParam(required = false) LocalDate toDate,
                                  @RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "10") int size,
                                  @RequestParam(defaultValue = "desc") String sort) {
        // Validar que el estado sea válido (solo PUBLICADA, VENCIDA, ARCHIVADA o null)
        if (estado != null && !estado.isBlank()) {
            if (!estado.equals("PUBLICADA") && !estado.equals("VENCIDA") && !estado.equals("ARCHIVADA")) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Estado inválido. Solo se permiten: PUBLICADA, VENCIDA, ARCHIVADA"));
            }
        }
        return ResponseEntity.ok(repo.findForGraduates(estado, sector, empresa, tipoContrato, search, fromDate, toDate, page, size, sort));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable java.util.UUID id) {
        return repo.findByIdForGraduate(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).body(java.util.Map.of("error", "Oferta no encontrada o no disponible")));
    }

    @PostMapping("/{id}/interest")
    public ResponseEntity<?> markInterest(@PathVariable java.util.UUID id, java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(java.util.Map.of("error", "No autenticado"));
        }
        java.util.UUID graduateId = java.util.UUID.fromString(principal.getName());
        
        // Verificar que la oferta existe y está publicada
        var job = repo.findByIdForGraduate(id).orElse(null);
        if (job == null) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", "Oferta no encontrada"));
        }
        if (job.getEstado() != com.corhuila.egresados.domain.model.JobOffer.Estado.PUBLICADA) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Solo se puede marcar interés en ofertas publicadas"));
        }
        
        // Verificar si ya existe
        var existing = jobInterests.findByJobOfferIdAndGraduateId(id, graduateId);
        if (existing.isPresent()) {
            return ResponseEntity.ok(java.util.Map.of("ok", true, "message", "Ya has marcado interés en esta oferta"));
        }
        
        // Crear nuevo interés
        var interest = new com.corhuila.egresados.infrastructure.persistence.jpa.entity.JobInterestEntity();
        interest.setId(java.util.UUID.randomUUID());
        interest.setJobOfferId(id);
        interest.setGraduateId(graduateId);
        interest.setCreatedAt(java.time.OffsetDateTime.now());
        jobInterests.save(interest);
        
        return ResponseEntity.ok(java.util.Map.of("ok", true));
    }
}
