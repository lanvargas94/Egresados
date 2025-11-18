package com.corhuila.egresados.infrastructure.persistence.jpa.repo;

import com.corhuila.egresados.infrastructure.persistence.jpa.entity.EventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface SpringEventJpaRepository extends JpaRepository<EventEntity, UUID> {
    @Query("select e from EventEntity e where e.estado = 'PUBLICADA' and e.fechaHora >= :ahora order by e.fechaHora asc")
    List<EventEntity> findPublicados(OffsetDateTime ahora);

    @Query("select e from EventEntity e where e.estado = 'PUBLICADA' and e.fechaHora < :ahora")
    List<EventEntity> findToFinalize(OffsetDateTime ahora);

    @Query("select e from EventEntity e where (:estado is null or e.estado = :estado) order by e.fechaHora desc")
    Page<EventEntity> adminList(String estado, Pageable pageable);

    @Query("select e from EventEntity e where e.estado = 'PUBLICADA' and e.fechaHora >= :ahora order by e.fechaHora asc")
    Page<EventEntity> findPublicados(OffsetDateTime ahora, Pageable pageable);
}
