package com.corhuila.egresados.infrastructure.persistence.jpa.repo;

import com.corhuila.egresados.infrastructure.persistence.jpa.entity.AdminUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SpringAdminUserJpaRepository extends JpaRepository<AdminUserEntity, UUID> {
    Optional<AdminUserEntity> findByUsername(String username);
}






