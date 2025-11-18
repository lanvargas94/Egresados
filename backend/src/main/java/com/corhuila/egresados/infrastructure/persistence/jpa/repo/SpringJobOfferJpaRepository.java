package com.corhuila.egresados.infrastructure.persistence.jpa.repo;

import com.corhuila.egresados.domain.model.JobOffer;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.JobOfferEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface SpringJobOfferJpaRepository extends JpaRepository<JobOfferEntity, UUID> {
    @Query("select j from JobOfferEntity j where j.estado = 'PUBLICADA' and j.fechaCierre >= :hoy " +
            "and (:sector is null or j.sector = :sector) " +
            "and (:empresa is null or j.empresa = :empresa) " +
            "and (:tipoContrato is null or j.tipoContrato = :tipoContrato) " +
            "order by j.fechaCierre asc")
    List<JobOfferEntity> findPublicadasVigentes(LocalDate hoy, String sector, String empresa, String tipoContrato);

    @Query("select j from JobOfferEntity j where j.estado = 'PUBLICADA' and j.fechaCierre < :hoy")
    List<JobOfferEntity> findToExpire(LocalDate hoy);

    @Query("select j from JobOfferEntity j where j.estado = 'PUBLICADA' and j.fechaCierre >= :hoy " +
            "and (:sector is null or j.sector = :sector) " +
            "and (:empresa is null or j.empresa = :empresa) " +
            "and (:tipoContrato is null or j.tipoContrato = :tipoContrato) " +
            "and (:fromDate is null or j.fechaCierre >= :fromDate) " +
            "and (:toDate is null or j.fechaCierre <= :toDate)")
    Page<JobOfferEntity> findPublicadasPaged(LocalDate hoy, String sector, String empresa, String tipoContrato, LocalDate fromDate, LocalDate toDate, Pageable pageable);

    @Query("select j from JobOfferEntity j where (:estado is null or j.estado = :estado)")
    Page<JobOfferEntity> adminList(String estado, Pageable pageable);
}
