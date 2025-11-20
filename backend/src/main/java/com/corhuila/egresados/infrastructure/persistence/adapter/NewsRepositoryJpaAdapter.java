package com.corhuila.egresados.infrastructure.persistence.adapter;

import com.corhuila.egresados.domain.model.News;
import com.corhuila.egresados.domain.ports.NewsRepository;
import com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringNewsJpaRepository;
import com.corhuila.egresados.infrastructure.persistence.mapper.NewsMapper;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.PageRequest;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public class NewsRepositoryJpaAdapter implements NewsRepository {
    private final SpringNewsJpaRepository jpa;

    public NewsRepositoryJpaAdapter(SpringNewsJpaRepository jpa) { this.jpa = jpa; }

    @Override
    public List<News> findPublicadasVigentes(OffsetDateTime ahora) {
        return jpa.findPublicadas(ahora).stream().map(NewsMapper::toDomain).toList();
    }

    @Override
    public News save(News news) {
        var entity = jpa.findById(news.getId())
                .orElse(new com.corhuila.egresados.infrastructure.persistence.jpa.entity.NewsEntity());
        NewsMapper.updateEntity(news, entity);
        var saved = jpa.save(entity);
        return NewsMapper.toDomain(saved);
    }

    @Override
    public com.corhuila.egresados.domain.util.PageResult<News> findPublicadasVigentes(OffsetDateTime ahora, int page, int size) {
        var pg = jpa.findPublicadas(ahora, null, null, PageRequest.of(page, size));
        return new com.corhuila.egresados.domain.util.PageResult<>(pg.getContent().stream().map(NewsMapper::toDomain).toList(), pg.getTotalElements(), page, size);
    }

    @Override
    public List<News> findToAutoPublish(OffsetDateTime ahora) {
        return jpa.findToAutoPublish(ahora).stream().map(NewsMapper::toDomain).toList();
    }

    @Override
    public com.corhuila.egresados.domain.util.PageResult<News> findPublicadasVigentes(OffsetDateTime ahora, String facultad, String programa, int page, int size) {
        var pg = jpa.findPublicadas(ahora, facultad, programa, PageRequest.of(page, size));
        return new com.corhuila.egresados.domain.util.PageResult<>(pg.getContent().stream().map(NewsMapper::toDomain).toList(), pg.getTotalElements(), page, size);
    }
}
