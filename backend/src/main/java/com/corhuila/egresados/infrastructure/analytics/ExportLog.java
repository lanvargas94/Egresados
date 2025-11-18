package com.corhuila.egresados.infrastructure.analytics;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "export_logs")
public class ExportLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String actor;
    private OffsetDateTime createdAt;
    @Column(length = 1000)
    private String filters;
    @Column(length = 1000)
    private String fields;
    private long count;
    private String format;

    public Long getId() { return id; }
    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public String getFilters() { return filters; }
    public void setFilters(String filters) { this.filters = filters; }
    public String getFields() { return fields; }
    public void setFields(String fields) { this.fields = fields; }
    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }
}

