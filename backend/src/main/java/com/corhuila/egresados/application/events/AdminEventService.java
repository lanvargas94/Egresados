package com.corhuila.egresados.application.events;

import com.corhuila.egresados.domain.model.Event;
import com.corhuila.egresados.domain.ports.EventRepository;

import java.time.OffsetDateTime;
import java.util.UUID;

public class AdminEventService {
    private final EventRepository repo;
    public AdminEventService(EventRepository repo) { this.repo = repo; }

    public Event create(Event e) {
        if (e.getId() == null) e.setId(UUID.randomUUID());
        if (e.getEstado() == null) e.setEstado(Event.Estado.BORRADOR);
        return repo.save(e);
    }

    public Event update(Event e) { return repo.save(e); }

    public Event publish(UUID id) {
        Event e = repo.findEvent(id).orElseThrow();
        if (e.getFechaHora() == null || e.getFechaHora().isBefore(OffsetDateTime.now()) ||
                (isBlank(e.getLugar()) && isBlank(e.getEnlaceVirtual()))) {
            throw new IllegalArgumentException("RN-AV01: fecha futura y lugar/enlace requeridos");
        }
        if (e.getCupos() != null && e.getCupos() < 1) {
            throw new IllegalArgumentException("RN-AV02: cupos debe ser ≥ 1");
        }
        e.setEstado(Event.Estado.PUBLICADA);
        return repo.save(e);
    }

    public Event archive(UUID id) {
        Event e = repo.findEvent(id).orElseThrow();
        e.setEstado(Event.Estado.ARCHIVADA);
        return repo.save(e);
    }

    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
}

