package com.corhuila.egresados.application.onboarding;

import com.corhuila.egresados.domain.model.EmploymentStatus;
import com.corhuila.egresados.domain.model.Graduate;
import com.corhuila.egresados.domain.ports.GraduateRepository;

import java.time.OffsetDateTime;
import java.util.UUID;

public class SaveOnboardingStep2UseCase {
    public record Command(UUID graduateId, EmploymentStatus situacion, String industria, String empresa, String cargo) {}

    private final GraduateRepository graduateRepository;

    public SaveOnboardingStep2UseCase(GraduateRepository graduateRepository) {
        this.graduateRepository = graduateRepository;
    }

    public Graduate handle(Command cmd) {
        Graduate g = graduateRepository.findById(cmd.graduateId())
                .orElseThrow(() -> new IllegalArgumentException("Egresado no encontrado"));
        if (cmd.situacion() == null) {
            throw new IllegalArgumentException("Situación laboral requerida (RN-V05)");
        }
        if (len(cmd.empresa()) > 120 || len(cmd.cargo()) > 120) {
            throw new IllegalArgumentException("Longitudes inválidas (RN-V06)");
        }
        g.setSituacionLaboral(cmd.situacion());
        g.setIndustria(cmd.industria());
        g.setEmpresa(cmd.empresa());
        g.setCargo(cmd.cargo());
        g.setActualizadoEn(OffsetDateTime.now());
        return graduateRepository.save(g);
    }

    private int len(String s) { return s == null ? 0 : s.length(); }
}

