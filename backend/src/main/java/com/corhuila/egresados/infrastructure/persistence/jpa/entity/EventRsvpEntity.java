package com.corhuila.egresados.infrastructure.persistence.jpa.entity;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "event_rsvp", uniqueConstraints = @UniqueConstraint(name = "ux_event_rsvp", columnNames = {"event_id", "graduate_id"}))
public class EventRsvpEntity {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;
    @Column(name = "event_id", columnDefinition = "uuid")
    private UUID eventId;
    @Column(name = "graduate_id", columnDefinition = "uuid")
    private UUID graduateId;
    private OffsetDateTime createdAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getEventId() { return eventId; }
    public void setEventId(UUID eventId) { this.eventId = eventId; }
    public UUID getGraduateId() { return graduateId; }
    public void setGraduateId(UUID graduateId) { this.graduateId = graduateId; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}

