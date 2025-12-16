package com.corhuila.egresados.infrastructure.persistence.jpa.entity;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "job_interests", uniqueConstraints = @UniqueConstraint(name = "ux_job_interests", columnNames = {"job_offer_id", "graduate_id"}))
public class JobInterestEntity {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;
    @Column(name = "job_offer_id", columnDefinition = "uuid")
    private UUID jobOfferId;
    @Column(name = "graduate_id", columnDefinition = "uuid")
    private UUID graduateId;
    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getJobOfferId() { return jobOfferId; }
    public void setJobOfferId(UUID jobOfferId) { this.jobOfferId = jobOfferId; }
    public UUID getGraduateId() { return graduateId; }
    public void setGraduateId(UUID graduateId) { this.graduateId = graduateId; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}




