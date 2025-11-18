package com.corhuila.egresados.infrastructure.persistence.jpa.entity;

import com.corhuila.egresados.domain.model.News;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "news")
public class NewsEntity {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    private String titulo;
    @Column(length = 500)
    private String resumen;
    @Column(columnDefinition = "text")
    private String cuerpoHtml;
    private OffsetDateTime fechaPublicacion;
    private String imagenUrl;
    private String adjuntoUrl;
    private String enlaceExterno;

    // Segmentación opcional (RN-N02 v1.1)
    private String facultad;
    private String programa;

    @Enumerated(EnumType.STRING)
    private News.Status estado;

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
    public String getFacultad() { return facultad; }
    public void setFacultad(String facultad) { this.facultad = facultad; }
    public String getPrograma() { return programa; }
    public void setPrograma(String programa) { this.programa = programa; }
    public News.Status getEstado() { return estado; }
    public void setEstado(News.Status estado) { this.estado = estado; }
}
