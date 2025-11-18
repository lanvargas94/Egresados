package com.corhuila.egresados.domain.model;

import java.time.LocalDate;
import java.util.UUID;

public class JobOffer {
    public enum Estado { BORRADOR, PUBLICADA, VENCIDA, ARCHIVADA }

    private UUID id;
    private String titulo;
    private String empresa;
    private String sector;
    private LocalDate fechaCierre;
    private String tipoContrato; // catálogo simple
    private String enlacePostulacion; // URL o email
    private String resumen;
    private Estado estado;

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
    public Estado getEstado() { return estado; }
    public void setEstado(Estado estado) { this.estado = estado; }
}

