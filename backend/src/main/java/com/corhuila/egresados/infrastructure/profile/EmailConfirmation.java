package com.corhuila.egresados.infrastructure.profile;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "email_confirmations")
public class EmailConfirmation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "graduate_id", columnDefinition = "uuid")
    private java.util.UUID graduateId;
    private String newEmail;
    private String token;
    private OffsetDateTime createdAt;
    private OffsetDateTime confirmedAt;

    public Long getId() { return id; }
    public java.util.UUID getGraduateId() { return graduateId; }
    public void setGraduateId(java.util.UUID graduateId) { this.graduateId = graduateId; }
    public String getNewEmail() { return newEmail; }
    public void setNewEmail(String newEmail) { this.newEmail = newEmail; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(OffsetDateTime confirmedAt) { this.confirmedAt = confirmedAt; }
}

