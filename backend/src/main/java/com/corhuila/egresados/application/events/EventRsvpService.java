package com.corhuila.egresados.application.events;

import com.corhuila.egresados.domain.model.Event;
import com.corhuila.egresados.domain.model.EventRsvp;
import com.corhuila.egresados.domain.ports.EventRepository;

import java.time.OffsetDateTime;
import java.util.UUID;

public class EventRsvpService {
    private final EventRepository repo;
    private final com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringEventWaitlistJpaRepository waitlistRepo;
    private final com.corhuila.egresados.infrastructure.mail.EmailService email;
    private final com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringGraduateJpaRepository grads;
    public EventRsvpService(EventRepository repo,
                            com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringEventWaitlistJpaRepository waitlistRepo,
                            com.corhuila.egresados.infrastructure.mail.EmailService email,
                            com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringGraduateJpaRepository grads) {
        this.repo = repo; this.waitlistRepo = waitlistRepo; this.email = email; this.grads = grads;
    }

    public EventRsvp rsvp(UUID eventId, UUID graduateId) {
        Event e = repo.findEvent(eventId).orElseThrow();
        if (e.getEstado() != Event.Estado.PUBLICADA) {
            throw new IllegalStateException("Evento no disponible");
        }
        if (e.getCupos() != null) {
            long count = repo.countRsvp(eventId);
            if (count >= e.getCupos()) {
                throw new IllegalStateException("Cupos agotados (RN-VT01)");
            }
        }
        if (repo.findRsvp(eventId, graduateId).isPresent()) {
            throw new IllegalStateException("RSVP duplicado (RN-VT02)");
        }
        EventRsvp r = new EventRsvp();
        r.setId(UUID.randomUUID());
        r.setEventId(eventId);
        r.setGraduateId(graduateId);
        r.setCreatedAt(OffsetDateTime.now());
        return repo.saveRsvp(r);
    }

    public void cancel(UUID eventId, UUID graduateId) {
        Event e = repo.findEvent(eventId).orElseThrow();
        int horas = e.getCancelacionHoras() == null ? 0 : e.getCancelacionHoras();
        if (e.getFechaHora().minusHours(horas).isBefore(OffsetDateTime.now())) {
            throw new IllegalStateException("Fuera de ventana de cancelación (RN-VT03)");
        }
        repo.deleteRsvp(eventId, graduateId);
        // RN-VT04: notificar primer en lista de espera
        var wl = waitlistRepo.findByEventIdOrderByCreatedAtAsc(eventId);
        var first = wl.stream().filter(x -> x.getNotifiedAt() == null).findFirst();
        if (first.isPresent()) {
            var g = grads.findById(first.get().getGraduateId()).orElse(null);
            if (g != null && g.getCorreoPersonal() != null) {
                try { email.sendHtml(g.getCorreoPersonal(), "Cupo disponible – Evento", "<p>Se liberó un cupo para el evento. Ingresa para confirmar tu RSVP.</p>"); } catch (Exception ignored) {}
                first.get().setNotifiedAt(OffsetDateTime.now());
                waitlistRepo.save(first.get());
            }
        }
    }
}
