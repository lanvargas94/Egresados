package com.corhuila.egresados.application.onboarding;

import com.corhuila.egresados.domain.model.Graduate;
import com.corhuila.egresados.domain.ports.GraduateRepository;

import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Pattern;

public class SaveOnboardingStep1UseCase {
    public record Command(UUID graduateId, String correoPersonal, String pais, String ciudad, String telefonoE164) {}

    private final GraduateRepository graduateRepository;
    private final com.corhuila.egresados.infrastructure.catalog.CatalogService catalogService;
    private static final Pattern EMAIL = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    public SaveOnboardingStep1UseCase(GraduateRepository graduateRepository,
                                      com.corhuila.egresados.infrastructure.catalog.CatalogService catalogService) {
        this.graduateRepository = graduateRepository;
        this.catalogService = catalogService;
    }

    public Graduate handle(Command cmd) {
        Graduate g = graduateRepository.findById(cmd.graduateId())
                .orElseThrow(() -> new IllegalArgumentException("Egresado no encontrado"));

        if (cmd.correoPersonal() == null || !EMAIL.matcher(cmd.correoPersonal()).matches() ||
                cmd.correoPersonal().toLowerCase().endsWith("@corhuila.edu.co")) {
            throw new IllegalArgumentException("Correo personal inválido o institucional (RN-V01)");
        }
        if (isBlank(cmd.pais()) || isBlank(cmd.ciudad())) {
            throw new IllegalArgumentException("País y Ciudad son requeridos (RN-V03)");
        }
        if (!catalogService.isValidCountry(cmd.pais()) || !catalogService.isValidCity(cmd.pais(), cmd.ciudad())) {
            throw new IllegalArgumentException("País/Ciudad no pertenecen al catálogo (RN-V03)");
        }
        String phoneE164 = null;
        if (cmd.telefonoE164() != null && !cmd.telefonoE164().isBlank()) {
            try {
                phoneE164 = catalogService.toE164OrThrow(cmd.telefonoE164(), cmd.pais());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Teléfono inválido: " + e.getMessage());
            }
        }

        g.setCorreoPersonal(cmd.correoPersonal());
        g.setPais(cmd.pais());
        g.setCiudad(cmd.ciudad());
        g.setTelefonoMovilE164(phoneE164);
        g.setActualizadoEn(OffsetDateTime.now());
        return graduateRepository.save(g);
    }

    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
}
