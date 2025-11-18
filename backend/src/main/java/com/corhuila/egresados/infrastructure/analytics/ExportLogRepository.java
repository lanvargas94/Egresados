package com.corhuila.egresados.infrastructure.analytics;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExportLogRepository extends JpaRepository<ExportLog, Long> {
    Page<ExportLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
