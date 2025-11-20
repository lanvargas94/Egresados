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
    @Column(name = "titulo")
    private String nombre;
    @Column(columnDefinition = "text")
    private String descripcion;
    @Column(name = "fecha_hora_inicio")
    private OffsetDateTime fechaHoraInicio;
    @Column(name = "fecha_hora_fin")
    private OffsetDateTime fechaHoraFin;
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_evento")
    private Event.TipoEvento tipoEvento;
    @Column(name = "enlace_conexion")
    private String enlaceConexion; // si es virtual
    @Column(name = "lugar_fisico")
    private String lugarFisico; // si es presencial
    private Integer capacidad;
    @Enumerated(EnumType.STRING)
    private Event.Estado estado;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public OffsetDateTime getFechaHoraInicio() { return fechaHoraInicio; }
    public void setFechaHoraInicio(OffsetDateTime fechaHoraInicio) { this.fechaHoraInicio = fechaHoraInicio; }
    public OffsetDateTime getFechaHoraFin() { return fechaHoraFin; }
    public void setFechaHoraFin(OffsetDateTime fechaHoraFin) { this.fechaHoraFin = fechaHoraFin; }
    public Event.TipoEvento getTipoEvento() { return tipoEvento; }
    public void setTipoEvento(Event.TipoEvento tipoEvento) { this.tipoEvento = tipoEvento; }
    public String getEnlaceConexion() { return enlaceConexion; }
    public void setEnlaceConexion(String enlaceConexion) { this.enlaceConexion = enlaceConexion; }
    public String getLugarFisico() { return lugarFisico; }
    public void setLugarFisico(String lugarFisico) { this.lugarFisico = lugarFisico; }
    public Integer getCapacidad() { return capacidad; }
    public void setCapacidad(Integer capacidad) { this.capacidad = capacidad; }
    public Event.Estado getEstado() { return estado; }
    public void setEstado(Event.Estado estado) { this.estado = estado; }
}

