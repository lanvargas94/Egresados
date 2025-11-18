package com.corhuila.egresados.infrastructure.catalog.repo;

import com.corhuila.egresados.infrastructure.catalog.entity.SectorEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SectorRepository extends JpaRepository<SectorEntity, Long> {
    Optional<SectorEntity> findByNameIgnoreCase(String name);
}

