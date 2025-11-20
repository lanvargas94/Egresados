package com.corhuila.egresados.infrastructure.persistence.adapter;

import com.corhuila.egresados.domain.model.JobOffer;
import com.corhuila.egresados.domain.ports.JobOfferRepository;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.JobOfferEntity;
import com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringJobOfferJpaRepository;
import com.corhuila.egresados.infrastructure.persistence.mapper.JobOfferMapper;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.util.ArrayList;
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
        java.time.OffsetDateTime hoyOffset = hoy.atStartOfDay(java.time.ZoneId.systemDefault()).toOffsetDateTime();
        return jpa.findPublicadasVigentes(hoyOffset, null, null, null).stream().map(JobOfferMapper::toDomain).toList();
    }

    public List<JobOffer> findPublicadasVigentes(LocalDate hoy, String sector, String empresa, String tipoContrato) {
        java.time.OffsetDateTime hoyOffset = hoy.atStartOfDay(java.time.ZoneId.systemDefault()).toOffsetDateTime();
        return jpa.findPublicadasVigentes(hoyOffset, sector, empresa, tipoContrato).stream().map(JobOfferMapper::toDomain).toList();
    }

    @Override
    public List<JobOffer> findToExpire(LocalDate hoy) {
        java.time.OffsetDateTime hoyOffset = hoy.atStartOfDay(java.time.ZoneId.systemDefault()).toOffsetDateTime();
        return jpa.findToExpire(hoyOffset).stream().map(JobOfferMapper::toDomain).toList();
    }

    @Override
    public com.corhuila.egresados.domain.util.PageResult<JobOffer> findPublicadas(LocalDate hoy, String sector, String empresa, String tipoContrato, LocalDate fromDate, LocalDate toDate, int page, int size, String sort) {
        java.time.OffsetDateTime hoyOffset = hoy.atStartOfDay(java.time.ZoneId.systemDefault()).toOffsetDateTime();
        java.time.OffsetDateTime fromOffset = fromDate != null ? fromDate.atStartOfDay(java.time.ZoneId.systemDefault()).toOffsetDateTime() : null;
        java.time.OffsetDateTime toOffset = toDate != null ? toDate.atTime(23, 59, 59).atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime() : null;
        var pageable = org.springframework.data.domain.PageRequest.of(page, size,
                ("desc".equalsIgnoreCase(sort) ? org.springframework.data.domain.Sort.Direction.DESC : org.springframework.data.domain.Sort.Direction.ASC),
                "fechaFinPublicacion");
        var pg = jpa.findPublicadasPaged(hoyOffset, sector, empresa, tipoContrato, fromOffset, toOffset, pageable);
        return new com.corhuila.egresados.domain.util.PageResult<>(pg.getContent().stream().map(JobOfferMapper::toDomain).toList(), pg.getTotalElements(), page, size);
    }

    @Override
    public com.corhuila.egresados.domain.util.PageResult<JobOffer> adminList(String estado, int page, int size) {
        var pageable = org.springframework.data.domain.PageRequest.of(page, size);
        var pg = jpa.adminList(estado, pageable);
        return new com.corhuila.egresados.domain.util.PageResult<>(pg.getContent().stream().map(JobOfferMapper::toDomain).toList(), pg.getTotalElements(), page, size);
    }

    @Override
    public com.corhuila.egresados.domain.util.PageResult<JobOffer> findForGraduates(String estado, String sector, String empresa, String tipoContrato, String search, LocalDate fromDate, LocalDate toDate, int page, int size, String sort) {
        final JobOffer.Estado estadoEnum;
        if (estado != null && !estado.isEmpty()) {
            try {
                estadoEnum = JobOffer.Estado.valueOf(estado);
            } catch (IllegalArgumentException e) {
                // Estado inválido, se mantiene como null
                return new com.corhuila.egresados.domain.util.PageResult<>(java.util.Collections.emptyList(), 0, page, size);
            }
        } else {
            estadoEnum = null;
        }
        
        final String finalSector = sector;
        final String finalEmpresa = empresa;
        final String finalTipoContrato = tipoContrato;
        final String finalSearch = search;
        final LocalDate finalFromDate = fromDate;
        final LocalDate finalToDate = toDate;
        
        // Construir la especificación dinámicamente para evitar problemas con parámetros null
        Specification<JobOfferEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Estado != BORRADOR
            predicates.add(cb.notEqual(root.get("estado"), com.corhuila.egresados.domain.model.JobOffer.Estado.BORRADOR));
            
            // Estado
            if (estadoEnum != null) {
                predicates.add(cb.equal(root.get("estado"), estadoEnum));
            }
            
            // Sector
            if (finalSector != null && !finalSector.isEmpty()) {
                predicates.add(cb.equal(root.get("sector"), finalSector));
            }
            
            // Empresa
            if (finalEmpresa != null && !finalEmpresa.isEmpty()) {
                predicates.add(cb.equal(root.get("empresa"), finalEmpresa));
            }
            
            // Tipo contrato
            if (finalTipoContrato != null && !finalTipoContrato.isEmpty()) {
                predicates.add(cb.equal(root.get("tipoContrato"), finalTipoContrato));
            }
            
            // Búsqueda por título o empresa
            if (finalSearch != null && !finalSearch.trim().isEmpty()) {
                final String searchLower = finalSearch.trim().toLowerCase();
                final String searchPattern = "%" + searchLower + "%";
                Predicate tituloLike = cb.like(cb.lower(root.get("titulo")), searchPattern);
                Predicate empresaLike = cb.like(cb.lower(root.get("empresa")), searchPattern);
                predicates.add(cb.or(tituloLike, empresaLike));
            }
            
            // Fecha inicio publicación >= fromDate
            if (finalFromDate != null) {
                java.time.OffsetDateTime fromOffset = finalFromDate.atStartOfDay(java.time.ZoneId.systemDefault()).toOffsetDateTime();
                predicates.add(cb.greaterThanOrEqualTo(root.get("fechaInicioPublicacion"), fromOffset));
            }
            
            // Fecha inicio publicación <= toDate
            if (finalToDate != null) {
                java.time.OffsetDateTime toOffset = finalToDate.atTime(23, 59, 59).atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime();
                predicates.add(cb.lessThanOrEqualTo(root.get("fechaInicioPublicacion"), toOffset));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        var pageable = org.springframework.data.domain.PageRequest.of(page, size,
                ("desc".equalsIgnoreCase(sort) ? org.springframework.data.domain.Sort.Direction.DESC : org.springframework.data.domain.Sort.Direction.ASC),
                "fechaInicioPublicacion");
        
        var pg = jpa.findAll(spec, pageable);
        return new com.corhuila.egresados.domain.util.PageResult<>(pg.getContent().stream().map(JobOfferMapper::toDomain).toList(), pg.getTotalElements(), page, size);
    }

    @Override
    public Optional<JobOffer> findByIdForGraduate(UUID id) {
        return jpa.findById(id)
                .filter(j -> j.getEstado() != com.corhuila.egresados.domain.model.JobOffer.Estado.BORRADOR)
                .map(JobOfferMapper::toDomain);
    }
}
