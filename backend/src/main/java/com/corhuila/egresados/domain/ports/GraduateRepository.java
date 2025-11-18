package com.corhuila.egresados.domain.ports;

import com.corhuila.egresados.domain.model.Graduate;

import java.util.Optional;
import java.util.UUID;

public interface GraduateRepository {
    Optional<Graduate> findByIdentificacion(String identificacion);
    Optional<Graduate> findById(UUID id);
    Graduate save(Graduate graduate);
    Optional<Graduate> findByCorreoPersonal(String correo);
}
