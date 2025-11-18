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
}

