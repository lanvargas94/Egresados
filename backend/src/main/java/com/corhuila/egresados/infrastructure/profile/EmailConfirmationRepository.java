package com.corhuila.egresados.infrastructure.profile;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmailConfirmationRepository extends JpaRepository<EmailConfirmation, Long> {
    Optional<EmailConfirmation> findByToken(String token);
    Optional<EmailConfirmation> findTopByGraduateIdAndConfirmedAtIsNullOrderByCreatedAtDesc(UUID graduateId);
}
