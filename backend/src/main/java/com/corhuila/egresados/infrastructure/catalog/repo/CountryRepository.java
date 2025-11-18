package com.corhuila.egresados.infrastructure.catalog.repo;

import com.corhuila.egresados.infrastructure.catalog.entity.CountryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CountryRepository extends JpaRepository<CountryEntity, String> {}

