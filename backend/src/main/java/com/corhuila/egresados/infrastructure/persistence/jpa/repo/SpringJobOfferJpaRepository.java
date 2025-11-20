package com.corhuila.egresados.infrastructure.persistence.jpa.repo;

import com.corhuila.egresados.infrastructure.persistence.jpa.entity.JobOfferEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface SpringJobOfferJpaRepository extends JpaRepository<JobOfferEntity, UUID>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<JobOfferEntity> {
    @Query("select j from JobOfferEntity j where j.estado = 'PUBLICADA' and (j.fechaFinPublicacion is null or j.fechaFinPublicacion >= :hoy) " +
            "and (:sector is null or j.sector = :sector) " +
            "and (:empresa is null or j.empresa = :empresa) " +
            "and (:tipoContrato is null or j.tipoContrato = :tipoContrato) " +
            "order by j.fechaFinPublicacion asc nulls last")
    List<JobOfferEntity> findPublicadasVigentes(java.time.OffsetDateTime hoy, String sector, String empresa, String tipoContrato);

    @Query("select j from JobOfferEntity j where j.estado = 'PUBLICADA' and j.fechaFinPublicacion is not null and j.fechaFinPublicacion < :hoy")
    List<JobOfferEntity> findToExpire(java.time.OffsetDateTime hoy);

    @Query("select j from JobOfferEntity j where j.estado = 'PUBLICADA' " +
            "and (j.fechaFinPublicacion is null or j.fechaFinPublicacion >= :hoy) " +
            "and (:sector is null or j.sector = :sector) " +
            "and (:empresa is null or j.empresa = :empresa) " +
            "and (:tipoContrato is null or j.tipoContrato = :tipoContrato) " +
            "and (:fromDate is null or j.fechaFinPublicacion >= :fromDate) " +
            "and (:toDate is null or j.fechaFinPublicacion <= :toDate)")
    Page<JobOfferEntity> findPublicadasPaged(java.time.OffsetDateTime hoy, String sector, String empresa, String tipoContrato, java.time.OffsetDateTime fromDate, java.time.OffsetDateTime toDate, Pageable pageable);


    @Query("select j from JobOfferEntity j where (:estado is null or j.estado = :estado)")
    Page<JobOfferEntity> adminList(String estado, Pageable pageable);
}
