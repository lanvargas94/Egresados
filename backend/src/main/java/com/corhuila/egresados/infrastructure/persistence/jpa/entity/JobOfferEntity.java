package com.corhuila.egresados.infrastructure.persistence.jpa.entity;

import com.corhuila.egresados.domain.model.JobOffer;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "job_offers")
public class JobOfferEntity {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;
    private String titulo;
    @Column(columnDefinition = "text")
    private String descripcion;
    private String empresa;
    private String tipoContrato;
    private String ciudad;
    private String modalidad; // PRESENCIAL, REMOTO, HIBRIDO
    private String rangoSalarial;
    @Column(name = "fecha_inicio_publicacion")
    private OffsetDateTime fechaInicioPublicacion;
    @Column(name = "fecha_fin_publicacion")
    private OffsetDateTime fechaFinPublicacion;
    private String sector;
    @Enumerated(EnumType.STRING)
    private JobOffer.Estado estado;

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
    public JobOffer.Estado getEstado() { return estado; }
    public void setEstado(JobOffer.Estado estado) { this.estado = estado; }
}

