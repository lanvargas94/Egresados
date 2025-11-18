package com.corhuila.egresados.infrastructure.catalog.repo;

import com.corhuila.egresados.infrastructure.catalog.entity.ContractTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContractTypeRepository extends JpaRepository<ContractTypeEntity, Long> {}

