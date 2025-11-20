package com.corhuila.egresados.infrastructure.persistence.jpa.repo;

import com.corhuila.egresados.infrastructure.persistence.jpa.entity.NewsEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface SpringNewsJpaRepository extends JpaRepository<NewsEntity, UUID> {
    @Query("select n from NewsEntity n where n.estado = 'PUBLICADA' and (n.fechaPublicacion is null or n.fechaPublicacion <= :ahora) order by n.fechaPublicacion desc nulls last")
    List<NewsEntity> findPublicadas(OffsetDateTime ahora);

    @Query("select n from NewsEntity n where n.estado = 'PUBLICADA' and (n.fechaPublicacion is null or n.fechaPublicacion <= :ahora) " +
            "and (:facultad is null or n.facultad is null or n.facultad = :facultad) " +
            "and (:programa is null or n.programa is null or n.programa = :programa) " +
            "order by n.fechaPublicacion desc nulls last")
    Page<NewsEntity> findPublicadas(OffsetDateTime ahora, String facultad, String programa, Pageable pageable);

    @Query("select n from NewsEntity n where n.estado = 'PROGRAMADA' and n.fechaPublicacion <= :ahora")
    List<NewsEntity> findToAutoPublish(OffsetDateTime ahora);

    @Query("select n from NewsEntity n where (:estadoStr IS NULL OR n.estado = :estadoStr) order by n.fechaPublicacion desc nulls last")
    Page<NewsEntity> adminList(String estadoStr, Pageable pageable);
}
