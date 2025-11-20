package com.corhuila.egresados.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class Event {
    public enum Estado { BORRADOR, PUBLICADA, FINALIZADA, ARCHIVADA }
    public enum TipoEvento { VIRTUAL, PRESENCIAL }

    private UUID id;
    private String nombre;
    private String descripcion;
    private OffsetDateTime fechaHoraInicio;
    private OffsetDateTime fechaHoraFin;
    private TipoEvento tipoEvento;
    private String enlaceConexion; // si es virtual
    private String lugarFisico; // si es presencial
    private Integer capacidad; // opcional
    private Estado estado;

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
    public TipoEvento getTipoEvento() { return tipoEvento; }
    public void setTipoEvento(TipoEvento tipoEvento) { this.tipoEvento = tipoEvento; }
    public String getEnlaceConexion() { return enlaceConexion; }
    public void setEnlaceConexion(String enlaceConexion) { this.enlaceConexion = enlaceConexion; }
    public String getLugarFisico() { return lugarFisico; }
    public void setLugarFisico(String lugarFisico) { this.lugarFisico = lugarFisico; }
    public Integer getCapacidad() { return capacidad; }
    public void setCapacidad(Integer capacidad) { this.capacidad = capacidad; }
    public Estado getEstado() { return estado; }
    public void setEstado(Estado estado) { this.estado = estado; }
}

