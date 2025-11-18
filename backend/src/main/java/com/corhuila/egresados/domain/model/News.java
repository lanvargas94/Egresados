package com.corhuila.egresados.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class News {
    public enum Status { BORRADOR, PROGRAMADA, PUBLICADA, ARCHIVADA }

    private UUID id;
    private String titulo;
    private String resumen;
    private String cuerpoHtml;
    private OffsetDateTime fechaPublicacion;
    private String imagenUrl;
    private String adjuntoUrl;
    private String enlaceExterno;
    private Status estado;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getResumen() { return resumen; }
    public void setResumen(String resumen) { this.resumen = resumen; }
    public String getCuerpoHtml() { return cuerpoHtml; }
    public void setCuerpoHtml(String cuerpoHtml) { this.cuerpoHtml = cuerpoHtml; }
    public OffsetDateTime getFechaPublicacion() { return fechaPublicacion; }
    public void setFechaPublicacion(OffsetDateTime fechaPublicacion) { this.fechaPublicacion = fechaPublicacion; }
    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }
    public String getAdjuntoUrl() { return adjuntoUrl; }
    public void setAdjuntoUrl(String adjuntoUrl) { this.adjuntoUrl = adjuntoUrl; }
    public String getEnlaceExterno() { return enlaceExterno; }
    public void setEnlaceExterno(String enlaceExterno) { this.enlaceExterno = enlaceExterno; }
    public Status getEstado() { return estado; }
    public void setEstado(Status estado) { this.estado = estado; }
}

