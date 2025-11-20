package com.corhuila.egresados.infrastructure.persistence.jpa.repo;

import com.corhuila.egresados.infrastructure.persistence.jpa.entity.BannerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpringBannerJpaRepository extends JpaRepository<BannerEntity, UUID> {
    List<BannerEntity> findByActivoTrueOrderByOrdenAsc();
}



