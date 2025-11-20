package com.corhuila.egresados.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class Banner {
    private UUID id;
    private String titulo;
    private String subtitulo;
    private String imagenUrl;
    private String enlaceAccion; // URL de acción del banner
    private Integer orden; // para ordenar los banners
    private boolean activo;
    private OffsetDateTime creadoEn;
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



