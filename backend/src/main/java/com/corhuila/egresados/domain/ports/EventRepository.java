package com.corhuila.egresados.domain.ports;

import com.corhuila.egresados.domain.model.Event;
import com.corhuila.egresados.domain.model.EventRsvp;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRepository {
    Event save(Event event);
    Optional<Event> findEvent(UUID id);
    List<Event> findPublicados(OffsetDateTime ahora);
    List<Event> findToFinalize(OffsetDateTime ahora);
    com.corhuila.egresados.domain.util.PageResult<Event> adminList(String estado, int page, int size);
    com.corhuila.egresados.domain.util.PageResult<Event> findPublicados(OffsetDateTime ahora, int page, int size);
    void delete(UUID id);

    EventRsvp saveRsvp(EventRsvp rsvp);
    Optional<EventRsvp> findRsvp(UUID eventId, UUID graduateId);
    void deleteRsvp(UUID eventId, UUID graduateId);
    long countRsvp(UUID eventId);
}
