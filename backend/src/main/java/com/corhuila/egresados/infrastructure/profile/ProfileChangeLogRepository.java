package com.corhuila.egresados.infrastructure.profile;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProfileChangeLogRepository extends JpaRepository<ProfileChangeLog, Long> {
    List<ProfileChangeLog> findByGraduateIdOrderByCreatedAtDesc(UUID graduateId, Pageable pageable);
}

