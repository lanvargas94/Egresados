package com.corhuila.egresados.infrastructure.integration;

import com.corhuila.egresados.domain.model.Program;
import com.corhuila.egresados.domain.ports.CorhuilaPlusPort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class CorhuilaPlusMockAdapter implements CorhuilaPlusPort {
    @Override
    public Optional<PersonaResult> buscarPorIdentificacion(String identificacion) {
        // Mock simple para desarrollo sin integrar aún.
        // Si el usuario ya existe en la BD, no debería llegar aquí
        // Pero por si acaso, retornamos empty para que use los datos de la BD
        return Optional.empty();
    }
}

