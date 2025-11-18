package com.corhuila.egresados.infrastructure.persistence.jpa.entity;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "event_waitlist", indexes = @Index(name = "idx_waitlist_event", columnList = "event_id, created_at"))
public class EventWaitlistEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "event_id", columnDefinition = "uuid", nullable = false)
    private UUID eventId;
    @Column(name = "graduate_id", columnDefinition = "uuid", nullable = false)
    private UUID graduateId;
    @Column(name = "created_at")
    private OffsetDateTime createdAt;
    @Column(name = "notified_at")
    private OffsetDateTime notifiedAt;

    public Long getId() { return id; }
    public UUID getEventId() { return eventId; }
    public void setEventId(UUID eventId) { this.eventId = eventId; }
    public UUID getGraduateId() { return graduateId; }
    public void setGraduateId(UUID graduateId) { this.graduateId = graduateId; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getNotifiedAt() { return notifiedAt; }
    public void setNotifiedAt(OffsetDateTime notifiedAt) { this.notifiedAt = notifiedAt; }
}

