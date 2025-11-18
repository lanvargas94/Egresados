package com.corhuila.egresados.infrastructure.catalog.repo;

import com.corhuila.egresados.infrastructure.catalog.entity.CityEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CityRepository extends JpaRepository<CityEntity, Long> {
    Optional<CityEntity> findByCountryCodeAndNameIgnoreCase(String countryCode, String name);
}

