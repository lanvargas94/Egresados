package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.application.events.AdminEventService;
import com.corhuila.egresados.domain.model.Event;
import com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringEventRsvpJpaRepository;
import com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringGraduateJpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/events")
public class AdminEventController {
    private final AdminEventService service;
    private final com.corhuila.egresados.infrastructure.audit.AuditService audit;
    private final SpringEventRsvpJpaRepository rsvps;
    private final SpringGraduateJpaRepository grads;
    public AdminEventController(AdminEventService service, com.corhuila.egresados.infrastructure.audit.AuditService audit,
                                SpringEventRsvpJpaRepository rsvps, SpringGraduateJpaRepository grads) { this.service = service; this.audit = audit; this.rsvps = rsvps; this.grads = grads; }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Event e) { e.setId(null); e.setEstado(Event.Estado.BORRADOR); var saved = service.create(e); audit.log("CREATE","Event", saved.getId().toString(), saved.getTitulo()); return ResponseEntity.ok(saved); }
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody Event e) { e.setId(id); var saved = service.update(e); audit.log("UPDATE","Event", saved.getId().toString(), saved.getTitulo()); return ResponseEntity.ok(saved); }
    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable UUID id, com.corhuila.egresados.domain.ports.EventRepository repo) { return ResponseEntity.ok(repo.findEvent(id).orElseThrow()); }
    @PostMapping("/{id}/publish")
    public ResponseEntity<?> publish(@PathVariable UUID id) { var saved = service.publish(id); audit.log("PUBLISH","Event", saved.getId().toString(), saved.getTitulo()); return ResponseEntity.ok(saved); }
    @PostMapping("/{id}/archive")
    public ResponseEntity<?> archive(@PathVariable UUID id) { var saved = service.archive(id); audit.log("ARCHIVE","Event", saved.getId().toString(), saved.getTitulo()); return ResponseEntity.ok(saved); }

    @GetMapping("/{id}/attendees/export")
    public ResponseEntity<?> exportAttendees(@PathVariable UUID id) {
        var list = rsvps.findByEventId(id);
        StringBuilder sb = new StringBuilder();
        sb.append("nombre,facultad,programa,correo\n");
        for (var r : list) {
            var g = grads.findWithProgramsById(r.getGraduateId()).orElse(null);
            if (g != null) {
                String nombre = g.getNombreLegal() == null ? "" : g.getNombreLegal().replace(","," ");
                String correo = g.getCorreoPersonal() == null ? "" : g.getCorreoPersonal();
                if (g.getProgramas() == null || g.getProgramas().isEmpty()) {
                    sb.append(nombre).append(",,,").append(correo).append("\n");
                } else {
                    for (var p : g.getProgramas()) {
                        String fac = p.getFacultad() == null ? "" : p.getFacultad().replace(","," ");
                        String prog = p.getPrograma() == null ? "" : p.getPrograma().replace(","," ");
                        sb.append(nombre).append(",").append(fac).append(",").append(prog).append(",").append(correo).append("\n");
                    }
                }
            }
        }
        return ResponseEntity.ok()
                .header("Content-Type","text/csv")
                .header("Content-Disposition","attachment; filename=attendees-"+id+".csv")
                .body(sb.toString());
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "10") int size,
                                  @RequestParam(required = false) String estado,
                                  com.corhuila.egresados.domain.ports.EventRepository repo) {
        var pg = repo.adminList(estado, page, size);
        return ResponseEntity.ok(java.util.Map.of("items", pg.getItems(), "total", pg.getTotal(), "page", pg.getPage(), "size", pg.getSize()));
    }

    @DeleteMapping("/{id}/rsvp")
    public ResponseEntity<?> adminCancelRsvp(@PathVariable UUID id, @RequestParam UUID graduateId,
                                             com.corhuila.egresados.domain.ports.EventRepository repo) {
        var e = repo.findEvent(id).orElseThrow();
        if (e.getFechaHora() != null && e.getFechaHora().isBefore(java.time.OffsetDateTime.now())) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error","RN-AV04: Solo antes del evento"));
        }
        repo.deleteRsvp(id, graduateId);
        audit.log("ADMIN_CANCEL_RSVP","Event", id.toString(), graduateId.toString());
        return ResponseEntity.ok(java.util.Map.of("ok", true));
    }
}
