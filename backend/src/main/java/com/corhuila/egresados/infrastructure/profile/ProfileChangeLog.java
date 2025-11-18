package com.corhuila.egresados.infrastructure.profile;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "profile_change_log")
public class ProfileChangeLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "graduate_id", columnDefinition = "uuid")
    private java.util.UUID graduateId;
    private OffsetDateTime createdAt;
    @Column(length = 1000)
    private String summary;

    public Long getId() { return id; }
    public java.util.UUID getGraduateId() { return graduateId; }
    public void setGraduateId(java.util.UUID graduateId) { this.graduateId = graduateId; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
}

