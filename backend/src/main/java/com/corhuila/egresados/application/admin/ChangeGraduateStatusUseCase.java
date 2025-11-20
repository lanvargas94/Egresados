package com.corhuila.egresados.application.admin;

import com.corhuila.egresados.domain.model.Graduate;
import com.corhuila.egresados.domain.model.GraduateStatus;
import com.corhuila.egresados.domain.ports.GraduateRepository;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ChangeGraduateStatusUseCase {
    private final GraduateRepository graduateRepository;

    public ChangeGraduateStatusUseCase(GraduateRepository graduateRepository) {
        this.graduateRepository = graduateRepository;
    }

    public Graduate handle(UUID graduateId, GraduateStatus newStatus) {
        Graduate g = graduateRepository.findById(graduateId)
                .orElseThrow(() -> new IllegalArgumentException("Egresado no encontrado"));
        g.setEstado(newStatus);
        g.setActualizadoEn(OffsetDateTime.now());
        return graduateRepository.save(g);
    }
}



