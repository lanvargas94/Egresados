package com.corhuila.egresados.application.onboarding;

import com.corhuila.egresados.domain.model.Graduate;
import com.corhuila.egresados.domain.ports.GraduateRepository;

import java.time.OffsetDateTime;
import java.util.UUID;

public class SaveOnboardingStep3UseCase {
    public record Command(UUID graduateId, boolean consentimiento) {}

    private final GraduateRepository graduateRepository;

    public SaveOnboardingStep3UseCase(GraduateRepository graduateRepository) {
        this.graduateRepository = graduateRepository;
    }

    public Graduate handle(Command cmd) {
        if (!cmd.consentimiento()) {
            throw new IllegalArgumentException("Debes aceptar la política de datos (Paso 3)");
        }
        Graduate g = graduateRepository.findById(cmd.graduateId())
                .orElseThrow(() -> new IllegalArgumentException("Egresado no encontrado"));
        g.setConsentimientoDatos(true);
        g.setOnboardingCompleto(true); // RN-O02
        g.setActualizadoEn(OffsetDateTime.now());
        return graduateRepository.save(g);
    }
}

