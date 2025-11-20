package com.corhuila.egresados.infrastructure.persistence.jpa.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "banners")
public class BannerEntity {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;
    private String titulo;
    private String subtitulo;
    @Column(name = "imagen_url")
    private String imagenUrl;
    @Column(name = "enlace_accion")
    private String enlaceAccion;
    private Integer orden;
    private boolean activo;
    @Column(name = "creado_en")
    private OffsetDateTime creadoEn;
    @Column(name = "actualizado_en")
    private OffsetDateTime actualizadoEn;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getSubtitulo() { return subtitulo; }
    public void setSubtitulo(String subtitulo) { this.subtitulo = subtitulo; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public String getEnlaceAccion() { return enlaceAccion; }
    public void setEnlaceAccion(String enlaceAccion) { this.enlaceAccion = enlaceAccion; }

    public Integer getOrden() { return orden; }
    public void setOrden(Integer orden) { this.orden = orden; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public OffsetDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(OffsetDateTime creadoEn) { this.creadoEn = creadoEn; }

    public OffsetDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(OffsetDateTime actualizadoEn) { this.actualizadoEn = actualizadoEn; }
}



