package com.corhuila.egresados.domain.ports;

import com.corhuila.egresados.domain.model.News;
import com.corhuila.egresados.domain.util.PageResult;

import java.time.OffsetDateTime;
import java.util.List;

public interface NewsRepository {
    List<News> findPublicadasVigentes(OffsetDateTime ahora);
    News save(News news);
    PageResult<News> findPublicadasVigentes(OffsetDateTime ahora, int page, int size);
    PageResult<News> findPublicadasVigentes(OffsetDateTime ahora, String facultad, String programa, int page, int size);
    List<News> findToAutoPublish(OffsetDateTime ahora);
}
