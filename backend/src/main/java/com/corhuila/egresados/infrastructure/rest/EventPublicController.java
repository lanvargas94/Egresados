package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.application.events.EventRsvpService;
import com.corhuila.egresados.domain.ports.EventRepository;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
public class EventPublicController {
    private final EventRepository repo;
    private final EventRsvpService rsvpService;

    public EventPublicController(EventRepository repo, EventRsvpService rsvpService) {
        this.repo = repo; this.rsvpService = rsvpService;
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "10") int size) {
        var pg = repo.findPublicados(OffsetDateTime.now(), page, size);
        // Enriquecer con cupos restantes (cálculo simple)
        java.util.UUID principalId = null;
        try { var p = (java.security.Principal) null; } catch (Exception ignored) {}
        var items = pg.getItems().stream().map(e -> {
            long count = repo.countRsvp(e.getId());
            long restantes = e.getCupos() == null ? -1 : Math.max(0, e.getCupos() - count);
            java.util.Map<String, Object> m = new java.util.HashMap<>();
            m.put("id", e.getId());
            m.put("titulo", e.getTitulo());
            m.put("fechaHora", e.getFechaHora());
            m.put("lugar", e.getLugar());
            m.put("enlaceVirtual", e.getEnlaceVirtual());
            m.put("descripcion", e.getDescripcion());
            m.put("cupos", e.getCupos());
            m.put("restantes", restantes);
            // hasRsvp si hay principal
            try {
                var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getName() != null) {
                    java.util.UUID gid = java.util.UUID.fromString(auth.getName());
                    boolean has = repo.findRsvp(e.getId(), gid).isPresent();
                    m.put("hasRsvp", has);
                }
            } catch (Exception ignored) {}
            return m;
        }).toList();
        return ResponseEntity.ok(new com.corhuila.egresados.domain.util.PageResult<>(items, pg.getTotal(), pg.getPage(), pg.getSize()));
    }

    @PostMapping("/{id}/rsvp")
    public ResponseEntity<?> rsvp(@PathVariable UUID id, @RequestParam(required = false) UUID graduateId, java.security.Principal principal) {
        if (graduateId == null && principal != null) graduateId = java.util.UUID.fromString(principal.getName());
        var r = rsvpService.rsvp(id, graduateId);
        return ResponseEntity.ok(Map.of("ok", true, "rsvpId", r.getId()));
    }

    @DeleteMapping("/{id}/rsvp")
    public ResponseEntity<?> cancel(@PathVariable UUID id, @RequestParam(required = false) UUID graduateId, java.security.Principal principal) {
        if (graduateId == null && principal != null) graduateId = java.util.UUID.fromString(principal.getName());
        rsvpService.cancel(id, graduateId);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/{id}/waitlist")
    public ResponseEntity<?> joinWaitlist(@PathVariable UUID id, java.security.Principal principal,
                                          com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringEventWaitlistJpaRepository waitlistRepo) {
        java.util.UUID gradId = java.util.UUID.fromString(principal.getName());
        var existing = waitlistRepo.findByEventIdAndGraduateId(id, gradId);
        if (existing.isPresent()) return ResponseEntity.ok(Map.of("ok", true));
        var e = new com.corhuila.egresados.infrastructure.persistence.jpa.entity.EventWaitlistEntity();
        e.setEventId(id); e.setGraduateId(gradId); e.setCreatedAt(OffsetDateTime.now());
        waitlistRepo.save(e);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
