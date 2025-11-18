package com.corhuila.egresados.infrastructure.persistence.adapter;

import com.corhuila.egresados.domain.model.Graduate;
import com.corhuila.egresados.domain.ports.GraduateRepository;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.GraduateEntity;
import com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringGraduateJpaRepository;
import com.corhuila.egresados.infrastructure.persistence.mapper.GraduateMapper;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class GraduateRepositoryJpaAdapter implements GraduateRepository {
    private final SpringGraduateJpaRepository jpa;

    public GraduateRepositoryJpaAdapter(SpringGraduateJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Optional<Graduate> findByIdentificacion(String identificacion) {
        return jpa.findByIdentificacion(identificacion).map(GraduateMapper::toDomain);
    }

    @Override
    public Optional<Graduate> findById(UUID id) {
        return jpa.findById(id).map(GraduateMapper::toDomain);
    }

    @Override
    public Graduate save(Graduate graduate) {
        GraduateEntity entity = jpa.findById(graduate.getId()).orElseGet(GraduateEntity::new);
        GraduateMapper.updateEntity(graduate, entity);
        GraduateEntity saved = jpa.save(entity);
        return GraduateMapper.toDomain(saved);
    }

    @Override
    public Optional<Graduate> findByCorreoPersonal(String correo) {
        return jpa.findByCorreoPersonalIgnoreCase(correo).map(GraduateMapper::toDomain);
    }
}
