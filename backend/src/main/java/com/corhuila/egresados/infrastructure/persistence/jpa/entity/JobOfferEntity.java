package com.corhuila.egresados.infrastructure.persistence.jpa.entity;

import com.corhuila.egresados.domain.model.JobOffer;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "job_offers")
public class JobOfferEntity {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;
    private String titulo;
    private String empresa;
    private String sector;
    private LocalDate fechaCierre;
    private String tipoContrato;
    private String enlacePostulacion;
    @Column(length = 1000)
    private String resumen;
    @Enumerated(EnumType.STRING)
    private JobOffer.Estado estado;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getEmpresa() { return empresa; }
    public void setEmpresa(String empresa) { this.empresa = empresa; }
    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }
    public LocalDate getFechaCierre() { return fechaCierre; }
    public void setFechaCierre(LocalDate fechaCierre) { this.fechaCierre = fechaCierre; }
    public String getTipoContrato() { return tipoContrato; }
    public void setTipoContrato(String tipoContrato) { this.tipoContrato = tipoContrato; }
    public String getEnlacePostulacion() { return enlacePostulacion; }
    public void setEnlacePostulacion(String enlacePostulacion) { this.enlacePostulacion = enlacePostulacion; }
    public String getResumen() { return resumen; }
    public void setResumen(String resumen) { this.resumen = resumen; }
    public JobOffer.Estado getEstado() { return estado; }
    public void setEstado(JobOffer.Estado estado) { this.estado = estado; }
}

