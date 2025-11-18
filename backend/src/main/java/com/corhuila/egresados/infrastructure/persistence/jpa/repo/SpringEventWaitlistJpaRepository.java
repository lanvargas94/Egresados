package com.corhuila.egresados.infrastructure.persistence.jpa.repo;

import com.corhuila.egresados.infrastructure.persistence.jpa.entity.EventWaitlistEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringEventWaitlistJpaRepository extends JpaRepository<EventWaitlistEntity, Long> {
    List<EventWaitlistEntity> findByEventIdOrderByCreatedAtAsc(UUID eventId);
    Optional<EventWaitlistEntity> findByEventIdAndGraduateId(UUID eventId, UUID graduateId);
}

