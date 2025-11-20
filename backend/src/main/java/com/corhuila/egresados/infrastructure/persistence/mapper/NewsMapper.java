package com.corhuila.egresados.infrastructure.persistence.mapper;

import com.corhuila.egresados.domain.model.News;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.NewsEntity;

public class NewsMapper {
    public static News toDomain(NewsEntity e) {
        if (e == null) return null;
        News n = new News();
        n.setId(e.getId());
        n.setTitulo(e.getTitulo());
        n.setResumen(e.getResumen());
        n.setCuerpoHtml(e.getCuerpoHtml());
        n.setFechaPublicacion(e.getFechaPublicacion());
        n.setImagenUrl(e.getImagenUrl());
        n.setAdjuntoUrl(e.getAdjuntoUrl());
        n.setEnlaceExterno(e.getEnlaceExterno());
        n.setEstado(e.getEstado());
        return n;
    }

    public static void updateEntity(News n, NewsEntity e) {
        if (n == null || e == null) return;
        e.setId(n.getId());
        e.setTitulo(n.getTitulo());
        e.setResumen(n.getResumen());
        e.setCuerpoHtml(n.getCuerpoHtml());
        e.setFechaPublicacion(n.getFechaPublicacion());
        e.setImagenUrl(n.getImagenUrl());
        e.setAdjuntoUrl(n.getAdjuntoUrl());
        e.setEnlaceExterno(n.getEnlaceExterno());
        e.setEstado(n.getEstado());
    }
}

