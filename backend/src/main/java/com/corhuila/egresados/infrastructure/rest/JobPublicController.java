package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.domain.ports.JobOfferRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/jobs")
public class JobPublicController {
    private final JobOfferRepository repo;
    public JobPublicController(JobOfferRepository repo) { this.repo = repo; }

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
}
