package com.corhuila.egresados.application.admin;

import com.corhuila.egresados.domain.model.Graduate;
import com.corhuila.egresados.domain.model.GraduateStatus;
import com.corhuila.egresados.domain.util.PageResult;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.GraduateEntity;
import com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringGraduateJpaRepository;
import com.corhuila.egresados.infrastructure.persistence.mapper.GraduateMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.util.stream.Collectors;

public class ListGraduatesUseCase {
    public record Filters(
        String programa,
        Integer anioGraduacion,
        GraduateStatus estado,
        String ciudad,
        String identificacion,
        String nombre
    ) {}

    private final SpringGraduateJpaRepository jpa;

    public ListGraduatesUseCase(SpringGraduateJpaRepository jpa) {
        this.jpa = jpa;
    }

    public PageResult<Graduate> handle(Filters filters, int page, int size) {
        Specification<GraduateEntity> spec = Specification.where(null);
        
        if (filters.programa() != null && !filters.programa().isBlank()) {
            spec = spec.and((root, query, cb) -> {
                var programaJoin = root.join("programas");
                return cb.equal(programaJoin.get("programa"), filters.programa());
            });
        }
        
        if (filters.anioGraduacion() != null) {
            spec = spec.and((root, query, cb) -> {
                var programaJoin = root.join("programas");
                return cb.equal(programaJoin.get("anio"), filters.anioGraduacion());
            });
        }
        
        if (filters.estado() != null) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("estado"), filters.estado()));
        }
        
        if (filters.ciudad() != null && !filters.ciudad().isBlank()) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(cb.upper(root.get("ciudad")), filters.ciudad().toUpperCase()));
        }
        
        if (filters.identificacion() != null && !filters.identificacion().isBlank()) {
            spec = spec.and((root, query, cb) -> 
                cb.like(cb.lower(root.get("identificacion")), 
                    "%" + filters.identificacion().toLowerCase() + "%"));
        }
        
        if (filters.nombre() != null && !filters.nombre().isBlank()) {
            spec = spec.and((root, query, cb) -> 
                cb.like(cb.lower(root.get("nombreLegal")), 
                    "%" + filters.nombre().toLowerCase() + "%"));
        }
        
        var pageRequest = PageRequest.of(page, size);
        org.springframework.data.domain.Page<GraduateEntity> pageResult = jpa.findAll(spec, pageRequest);
        
        var graduates = pageResult.getContent().stream()
            .map(GraduateMapper::toDomain)
            .collect(Collectors.toList());
        
        return new PageResult<>(graduates, pageResult.getTotalElements(), page, size);
    }
}

