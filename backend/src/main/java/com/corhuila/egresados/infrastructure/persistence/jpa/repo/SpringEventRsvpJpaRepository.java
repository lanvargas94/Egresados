package com.corhuila.egresados.infrastructure.persistence.jpa.repo;

import com.corhuila.egresados.infrastructure.persistence.jpa.entity.EventRsvpEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface SpringEventRsvpJpaRepository extends JpaRepository<EventRsvpEntity, UUID> {
    Optional<EventRsvpEntity> findByEventIdAndGraduateId(UUID eventId, UUID graduateId);

    @Modifying
    void deleteByEventIdAndGraduateId(UUID eventId, UUID graduateId);

    long countByEventId(UUID eventId);

    java.util.List<EventRsvpEntity> findByEventId(UUID eventId);
}
