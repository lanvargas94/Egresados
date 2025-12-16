package com.corhuila.egresados.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class JobInterest {
    private UUID id;
    private UUID jobOfferId;
    private UUID graduateId;
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




