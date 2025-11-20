package com.corhuila.egresados.application.admin;

import com.corhuila.egresados.domain.model.Graduate;
import com.corhuila.egresados.domain.model.GraduateStatus;
import com.corhuila.egresados.domain.ports.GraduateRepository;

import java.time.OffsetDateTime;
import java.util.UUID;

public class UpdateGraduateUseCase {
    public record Command(
        UUID graduateId,
        String correoPersonal,
        String pais,
        String ciudad,
        String telefonoMovil,
        String observacionesInternas,
        GraduateStatus estado
    ) {}

    private final GraduateRepository graduateRepository;

    public UpdateGraduateUseCase(GraduateRepository graduateRepository) {
        this.graduateRepository = graduateRepository;
    }

    public Graduate handle(Command cmd) {
        Graduate g = graduateRepository.findById(cmd.graduateId())
                .orElseThrow(() -> new IllegalArgumentException("Egresado no encontrado"));

        // NO se permite cambiar identificación ni campos críticos de autenticación
        if (cmd.correoPersonal() != null) {
            g.setCorreoPersonal(cmd.correoPersonal());
        }
        if (cmd.pais() != null) {
            g.setPais(cmd.pais());
        }
        if (cmd.ciudad() != null) {
            g.setCiudad(cmd.ciudad());
        }
        if (cmd.telefonoMovil() != null) {
            g.setTelefonoMovilE164(cmd.telefonoMovil());
        }
        if (cmd.observacionesInternas() != null) {
            g.setObservacionesInternas(cmd.observacionesInternas());
        }
        if (cmd.estado() != null) {
            g.setEstado(cmd.estado());
        }

        g.setActualizadoEn(OffsetDateTime.now());
        return graduateRepository.save(g);
    }
}



