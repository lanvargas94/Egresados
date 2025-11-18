package com.corhuila.egresados.infrastructure.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GraduateOtpRepository extends JpaRepository<GraduateOtpEntity, Long> {
    Optional<GraduateOtpEntity> findTopByGraduateIdOrderByCreatedAtDesc(UUID graduateId);
    long countByGraduateIdAndCreatedAtAfter(UUID graduateId, java.time.OffsetDateTime after);
}
