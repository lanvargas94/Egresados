package com.corhuila.egresados.infrastructure.auth;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "graduate_otp", indexes = @Index(name = "idx_grad_otp_grad", columnList = "graduate_id"))
public class GraduateOtpEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "graduate_id", columnDefinition = "uuid")
    private UUID graduateId;
    private String code;
    private OffsetDateTime expiresAt;
    private int attempts;
    private OffsetDateTime createdAt;
    private OffsetDateTime consumedAt;

    public Long getId() { return id; }
    public UUID getGraduateId() { return graduateId; }
    public void setGraduateId(UUID graduateId) { this.graduateId = graduateId; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public OffsetDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(OffsetDateTime expiresAt) { this.expiresAt = expiresAt; }
    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) { this.attempts = attempts; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getConsumedAt() { return consumedAt; }
    public void setConsumedAt(OffsetDateTime consumedAt) { this.consumedAt = consumedAt; }
}

