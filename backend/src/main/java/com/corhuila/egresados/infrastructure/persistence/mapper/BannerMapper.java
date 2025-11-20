package com.corhuila.egresados.infrastructure.persistence.mapper;

import com.corhuila.egresados.domain.model.Banner;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.BannerEntity;

public class BannerMapper {
    public static Banner toDomain(BannerEntity e) {
        if (e == null) return null;
        Banner b = new Banner();
        b.setId(e.getId());
        b.setTitulo(e.getTitulo());
        b.setSubtitulo(e.getSubtitulo());
        b.setImagenUrl(e.getImagenUrl());
        b.setEnlaceAccion(e.getEnlaceAccion());
        b.setOrden(e.getOrden());
        b.setActivo(e.isActivo());
        b.setCreadoEn(e.getCreadoEn());
        b.setActualizadoEn(e.getActualizadoEn());
        return b;
    }

    public static BannerEntity toEntity(Banner b) {
        if (b == null) return null;
        BannerEntity e = new BannerEntity();
        e.setId(b.getId());
        e.setTitulo(b.getTitulo());
        e.setSubtitulo(b.getSubtitulo());
        e.setImagenUrl(b.getImagenUrl());
        e.setEnlaceAccion(b.getEnlaceAccion());
        e.setOrden(b.getOrden());
        e.setActivo(b.isActivo());
        e.setCreadoEn(b.getCreadoEn());
        e.setActualizadoEn(b.getActualizadoEn());
        return e;
    }

    public static void updateEntity(Banner b, BannerEntity e) {
        e.setTitulo(b.getTitulo());
        e.setSubtitulo(b.getSubtitulo());
        e.setImagenUrl(b.getImagenUrl());
        e.setEnlaceAccion(b.getEnlaceAccion());
        e.setOrden(b.getOrden());
        e.setActivo(b.isActivo());
        e.setActualizadoEn(b.getActualizadoEn());
    }
}



