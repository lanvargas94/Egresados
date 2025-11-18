package com.corhuila.egresados.infrastructure.catalog.repo;

import com.corhuila.egresados.infrastructure.catalog.entity.ProgramCatalogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgramCatalogRepository extends JpaRepository<ProgramCatalogEntity, Long> {
    List<ProgramCatalogEntity> findByFacultyNameOrderByNameAsc(String facultyName);
}

