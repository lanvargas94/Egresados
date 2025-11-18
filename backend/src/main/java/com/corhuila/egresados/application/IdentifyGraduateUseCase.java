package com.corhuila.egresados.application;

import com.corhuila.egresados.domain.model.Graduate;
import com.corhuila.egresados.domain.model.Program;
import com.corhuila.egresados.domain.ports.CorhuilaPlusPort;
import com.corhuila.egresados.domain.ports.GraduateRepository;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

public class IdentifyGraduateUseCase {
    public record Result(Status status, UUID graduateId, String nombreLegal, String mensaje) {
        public enum Status { ONBOARDING, PANEL, NO_ENCONTRADO, BLOQUEO }
    }

    private final GraduateRepository graduateRepository;
    private final CorhuilaPlusPort corhuilaPlusPort;

    public IdentifyGraduateUseCase(GraduateRepository graduateRepository, CorhuilaPlusPort corhuilaPlusPort) {
        this.graduateRepository = graduateRepository;
        this.corhuilaPlusPort = corhuilaPlusPort;
    }

    public Result handle(String identificacion) {
        Optional<Graduate> existente = graduateRepository.findByIdentificacion(identificacion);
        if (existente.isPresent()) {
            Graduate g = existente.get();
            return new Result(
                    g.isOnboardingCompleto() ? Result.Status.PANEL : Result.Status.ONBOARDING,
                    g.getId(),
                    g.getNombreLegal(),
                    null
            );
        }

        Optional<CorhuilaPlusPort.PersonaResult> persona = corhuilaPlusPort.buscarPorIdentificacion(identificacion);
        if (persona.isEmpty()) {
            return new Result(Result.Status.NO_ENCONTRADO, null, null,
                    "No encontramos tu registro. Verifica tu documento o contacta Registro Académico.");
        }

        var p = persona.get();
        Graduate nuevo = new Graduate();
        nuevo.setId(UUID.randomUUID());
        nuevo.setIdentificacion(identificacion);
        nuevo.setIdInterno(p.idInterno);
        nuevo.setNombreLegal(p.nombreLegal);
        nuevo.setProgramas(p.programas != null ? p.programas : new ArrayList<Program>());
        nuevo.setOnboardingCompleto(false);
        nuevo.setCreadoEn(OffsetDateTime.now());
        nuevo.setActualizadoEn(OffsetDateTime.now());
        Graduate guardado = graduateRepository.save(nuevo);

        return new Result(Result.Status.ONBOARDING, guardado.getId(), guardado.getNombreLegal(), null);
    }
}

