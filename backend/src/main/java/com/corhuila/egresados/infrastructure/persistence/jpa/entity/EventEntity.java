package com.corhuila.egresados.infrastructure.persistence.jpa.entity;

import com.corhuila.egresados.domain.model.Event;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "events")
public class EventEntity {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;
    private String titulo;
    private OffsetDateTime fechaHora;
    private String lugar;
    private String enlaceVirtual;
    @Column(columnDefinition = "text")
    private String descripcion;
    private Integer cupos;
    private Integer cancelacionHoras;
    @Enumerated(EnumType.STRING)
    private Event.Estado estado;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public OffsetDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(OffsetDateTime fechaHora) { this.fechaHora = fechaHora; }
    public String getLugar() { return lugar; }
    public void setLugar(String lugar) { this.lugar = lugar; }
    public String getEnlaceVirtual() { return enlaceVirtual; }
    public void setEnlaceVirtual(String enlaceVirtual) { this.enlaceVirtual = enlaceVirtual; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Integer getCupos() { return cupos; }
    public void setCupos(Integer cupos) { this.cupos = cupos; }
    public Integer getCancelacionHoras() { return cancelacionHoras; }
    public void setCancelacionHoras(Integer cancelacionHoras) { this.cancelacionHoras = cancelacionHoras; }
    public Event.Estado getEstado() { return estado; }
    public void setEstado(Event.Estado estado) { this.estado = estado; }
}

