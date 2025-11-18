package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.application.IdentifyGraduateUseCase;
import com.corhuila.egresados.infrastructure.rest.dto.IdentifyRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final IdentifyGraduateUseCase identifyGraduateUseCase;

    public AuthController(IdentifyGraduateUseCase identifyGraduateUseCase) {
        this.identifyGraduateUseCase = identifyGraduateUseCase;
    }

    @PostMapping("/identify")
    public ResponseEntity<?> identify(@Valid @RequestBody IdentifyRequest request) {
        try {
            var res = identifyGraduateUseCase.handle(request.numeroIdentificacion);
            Map<String, Object> body = new HashMap<>();
            body.put("status", res.status().name().toLowerCase());
            if (res.graduateId() != null) {
                body.put("graduateId", res.graduateId().toString());
            }
            if (res.nombreLegal() != null) {
                body.put("nombre", res.nombreLegal());
            }
            if (res.mensaje() != null) {
                body.put("mensaje", res.mensaje());
            }
            return ResponseEntity.ok(body);
        } catch (Exception ex) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error del servidor. Por favor, intenta de nuevo más tarde.");
            return ResponseEntity.status(500).body(error);
        }
    }
}

