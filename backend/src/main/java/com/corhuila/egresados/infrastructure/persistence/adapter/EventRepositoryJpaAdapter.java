package com.corhuila.egresados.infrastructure.persistence.adapter;

import com.corhuila.egresados.domain.model.Event;
import com.corhuila.egresados.domain.model.EventRsvp;
import com.corhuila.egresados.domain.ports.EventRepository;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.EventEntity;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.EventRsvpEntity;
import com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringEventJpaRepository;
import com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringEventRsvpJpaRepository;
import com.corhuila.egresados.infrastructure.persistence.mapper.EventMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class EventRepositoryJpaAdapter implements EventRepository {
    private final SpringEventJpaRepository events;
    private final SpringEventRsvpJpaRepository rsvps;

    public EventRepositoryJpaAdapter(SpringEventJpaRepository events, SpringEventRsvpJpaRepository rsvps) {
        this.events = events; this.rsvps = rsvps;
    }

    @Override
    public Event save(Event event) {
        EventEntity e = events.findById(event.getId() == null ? UUID.randomUUID() : event.getId())
                .orElse(new EventEntity());
        if (event.getId() == null) event.setId(UUID.randomUUID());
        EventMapper.updateEntity(event, e);
        return EventMapper.toDomain(events.save(e));
    }

    @Override
    public Optional<Event> findEvent(UUID id) { return events.findById(id).map(EventMapper::toDomain); }

    @Override
    public List<Event> findPublicados(OffsetDateTime ahora) {
        return events.findPublicados(ahora).stream().map(EventMapper::toDomain).toList();
    }

    @Override
    public List<Event> findToFinalize(OffsetDateTime ahora) {
        return events.findToFinalize(ahora).stream().map(EventMapper::toDomain).toList();
    }

    @Override
    @Transactional
    public EventRsvp saveRsvp(EventRsvp rsvp) {
        EventRsvpEntity e = new EventRsvpEntity();
        if (rsvp.getId() == null) rsvp.setId(UUID.randomUUID());
        EventMapper.updateEntity(rsvp, e);
        return EventMapper.toDomain(rsvps.save(e));
    }

    @Override
    public Optional<EventRsvp> findRsvp(UUID eventId, UUID graduateId) {
        return rsvps.findByEventIdAndGraduateId(eventId, graduateId).map(EventMapper::toDomain);
    }

    @Override
    @Transactional
    public void deleteRsvp(UUID eventId, UUID graduateId) {
        rsvps.deleteByEventIdAndGraduateId(eventId, graduateId);
    }

    @Override
    public long countRsvp(UUID eventId) { return rsvps.countByEventId(eventId); }

    @Override
    public com.corhuila.egresados.domain.util.PageResult<Event> adminList(String estado, int page, int size) {
        var pg = events.adminList(estado, org.springframework.data.domain.PageRequest.of(page, size));
        return new com.corhuila.egresados.domain.util.PageResult<>(pg.getContent().stream().map(EventMapper::toDomain).toList(), pg.getTotalElements(), page, size);
    }

    @Override
    public com.corhuila.egresados.domain.util.PageResult<Event> findPublicados(OffsetDateTime ahora, int page, int size) {
        var pg = events.findPublicados(ahora, org.springframework.data.domain.PageRequest.of(page, size));
        return new com.corhuila.egresados.domain.util.PageResult<>(pg.getContent().stream().map(EventMapper::toDomain).toList(), pg.getTotalElements(), page, size);
    }
}
