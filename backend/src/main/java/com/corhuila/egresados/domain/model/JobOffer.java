package com.corhuila.egresados.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class JobOffer {
    public enum Estado { BORRADOR, PUBLICADA, VENCIDA, ARCHIVADA }

    private UUID id;
    private String titulo;
    private String descripcion;
    private String empresa;
    private String tipoContrato; // catálogo simple
    private String ciudad; // ubicación
    private String modalidad; // PRESENCIAL, REMOTO, HIBRIDO
    private String rangoSalarial; // opcional
    private OffsetDateTime fechaInicioPublicacion;
    private OffsetDateTime fechaFinPublicacion;
    private String sector; // opcional
    private Estado estado;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getEmpresa() { return empresa; }
    public void setEmpresa(String empresa) { this.empresa = empresa; }
    public String getTipoContrato() { return tipoContrato; }
    public void setTipoContrato(String tipoContrato) { this.tipoContrato = tipoContrato; }
    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }
    public String getModalidad() { return modalidad; }
    public void setModalidad(String modalidad) { this.modalidad = modalidad; }
    public String getRangoSalarial() { return rangoSalarial; }
    public void setRangoSalarial(String rangoSalarial) { this.rangoSalarial = rangoSalarial; }
    public OffsetDateTime getFechaInicioPublicacion() { return fechaInicioPublicacion; }
    public void setFechaInicioPublicacion(OffsetDateTime fechaInicioPublicacion) { this.fechaInicioPublicacion = fechaInicioPublicacion; }
    public OffsetDateTime getFechaFinPublicacion() { return fechaFinPublicacion; }
    public void setFechaFinPublicacion(OffsetDateTime fechaFinPublicacion) { this.fechaFinPublicacion = fechaFinPublicacion; }
    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }
    public Estado getEstado() { return estado; }
    public void setEstado(Estado estado) { this.estado = estado; }
}

