package com.corhuila.egresados.infrastructure.persistence.jpa.repo;

import com.corhuila.egresados.infrastructure.persistence.jpa.entity.JobInterestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringJobInterestJpaRepository extends JpaRepository<JobInterestEntity, UUID> {
    Optional<JobInterestEntity> findByJobOfferIdAndGraduateId(UUID jobOfferId, UUID graduateId);

    @Modifying
    void deleteByJobOfferIdAndGraduateId(UUID jobOfferId, UUID graduateId);

    long countByJobOfferId(UUID jobOfferId);

    List<JobInterestEntity> findByJobOfferId(UUID jobOfferId);
}




