package com.corhuila.egresados.infrastructure.persistence.adapter;

import com.corhuila.egresados.domain.model.JobOffer;
import com.corhuila.egresados.domain.ports.JobOfferRepository;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.JobOfferEntity;
import com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringJobOfferJpaRepository;
import com.corhuila.egresados.infrastructure.persistence.mapper.JobOfferMapper;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class JobOfferRepositoryJpaAdapter implements JobOfferRepository {
    private final SpringJobOfferJpaRepository jpa;
    public JobOfferRepositoryJpaAdapter(SpringJobOfferJpaRepository jpa) { this.jpa = jpa; }

    @Override
    public JobOffer save(JobOffer job) {
        JobOfferEntity e = jpa.findById(job.getId() == null ? UUID.randomUUID() : job.getId())
                .orElse(new JobOfferEntity());
        if (job.getId() == null) job.setId(UUID.randomUUID());
        JobOfferMapper.updateEntity(job, e);
        return JobOfferMapper.toDomain(jpa.save(e));
    }

    @Override
    public Optional<JobOffer> findById(UUID id) {
        return jpa.findById(id).map(JobOfferMapper::toDomain);
    }

    @Override
    public List<JobOffer> findPublicadasVigentes(LocalDate hoy) {
        return jpa.findPublicadasVigentes(hoy, null, null, null).stream().map(JobOfferMapper::toDomain).toList();
    }

    public List<JobOffer> findPublicadasVigentes(LocalDate hoy, String sector, String empresa, String tipoContrato) {
        return jpa.findPublicadasVigentes(hoy, sector, empresa, tipoContrato).stream().map(JobOfferMapper::toDomain).toList();
    }

    @Override
    public List<JobOffer> findToExpire(LocalDate hoy) {
        return jpa.findToExpire(hoy).stream().map(JobOfferMapper::toDomain).toList();
    }

    @Override
    public com.corhuila.egresados.domain.util.PageResult<JobOffer> findPublicadas(LocalDate hoy, String sector, String empresa, String tipoContrato, LocalDate fromDate, LocalDate toDate, int page, int size, String sort) {
        var pageable = org.springframework.data.domain.PageRequest.of(page, size,
                ("desc".equalsIgnoreCase(sort) ? org.springframework.data.domain.Sort.Direction.DESC : org.springframework.data.domain.Sort.Direction.ASC),
                "fechaCierre");
        var pg = jpa.findPublicadasPaged(hoy, sector, empresa, tipoContrato, fromDate, toDate, pageable);
        return new com.corhuila.egresados.domain.util.PageResult<>(pg.getContent().stream().map(JobOfferMapper::toDomain).toList(), pg.getTotalElements(), page, size);
    }

    @Override
    public com.corhuila.egresados.domain.util.PageResult<JobOffer> adminList(String estado, int page, int size) {
        var pageable = org.springframework.data.domain.PageRequest.of(page, size);
        var pg = jpa.adminList(estado, pageable);
        return new com.corhuila.egresados.domain.util.PageResult<>(pg.getContent().stream().map(JobOfferMapper::toDomain).toList(), pg.getTotalElements(), page, size);
    }
}
