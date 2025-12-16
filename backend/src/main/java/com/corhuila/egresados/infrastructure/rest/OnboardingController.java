package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.application.onboarding.SaveOnboardingStep1UseCase;
import com.corhuila.egresados.application.onboarding.SaveOnboardingStep2UseCase;
import com.corhuila.egresados.application.onboarding.SaveOnboardingStep3UseCase;
import com.corhuila.egresados.infrastructure.rest.dto.OnboardingStep1Request;
import com.corhuila.egresados.infrastructure.rest.dto.OnboardingStep2Request;
import com.corhuila.egresados.infrastructure.rest.dto.OnboardingStep3Request;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/onboarding")
@Tag(name = "03. Onboarding", description = "Proceso de registro inicial de egresados en 3 pasos: contacto, información laboral y consentimiento")
public class OnboardingController {
    private final SaveOnboardingStep1UseCase step1;
    private final SaveOnboardingStep2UseCase step2;
    private final SaveOnboardingStep3UseCase step3;

    public OnboardingController(SaveOnboardingStep1UseCase step1,
                                SaveOnboardingStep2UseCase step2,
                                SaveOnboardingStep3UseCase step3) {
        this.step1 = step1;
        this.step2 = step2;
        this.step3 = step3;
    }

    @Operation(
            summary = "Paso 1: Datos de contacto",
            description = "Guarda los datos de contacto del egresado (email, teléfono, país, ciudad). Requiere autenticación JWT."
    )
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/step1")
    public ResponseEntity<?> saveStep1(@Valid @RequestBody OnboardingStep1Request req) {
        try {
        var g = step1.handle(new SaveOnboardingStep1UseCase.Command(
                req.graduateId, req.correoPersonal, req.pais, req.ciudad, req.telefonoMovil
        ));
        return ResponseEntity.ok(Map.of("ok", true, "graduateId", g.getId()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(400).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error del servidor. Por favor, intenta de nuevo más tarde."));
        }
    }

    @Operation(
            summary = "Paso 2: Información laboral",
            description = "Guarda la información laboral del egresado (situación, industria, empresa, cargo). Requiere autenticación JWT."
    )
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/step2")
    public ResponseEntity<?> saveStep2(@Valid @RequestBody OnboardingStep2Request req) {
        try {
        var g = step2.handle(new SaveOnboardingStep2UseCase.Command(
                req.graduateId, req.situacionLaboral, req.industria, req.empresa, req.cargo
        ));
        return ResponseEntity.ok(Map.of("ok", true, "graduateId", g.getId()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(400).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error del servidor. Por favor, intenta de nuevo más tarde."));
        }
    }

    @Operation(
            summary = "Paso 3: Consentimiento",
            description = "Guarda el consentimiento de datos y marca el onboarding como completo. Requiere autenticación JWT."
    )
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/step3")
    public ResponseEntity<?> saveStep3(@Valid @RequestBody OnboardingStep3Request req) {
        try {
        var g = step3.handle(new SaveOnboardingStep3UseCase.Command(
                req.graduateId, req.consentimiento
        ));
        return ResponseEntity.ok(Map.of("ok", true, "graduateId", g.getId(), "onboardingCompleto", g.isOnboardingCompleto()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(400).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error del servidor. Por favor, intenta de nuevo más tarde."));
        }
    }
}

