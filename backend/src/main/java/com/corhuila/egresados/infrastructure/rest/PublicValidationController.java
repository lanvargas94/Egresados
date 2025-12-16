package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.domain.ports.GraduateRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/validate")
@io.swagger.v3.oas.annotations.tags.Tag(name = "05. Catálogos Públicos", description = "Consulta de catálogos maestros: países, ciudades, facultades, programas, sectores y tipos de contrato")
public class PublicValidationController {
    private final GraduateRepository grads;
    public PublicValidationController(GraduateRepository grads) { this.grads = grads; }

    @GetMapping("/email-available")
    public ResponseEntity<?> emailAvailable(@RequestParam String email, @RequestParam(required = false) UUID excludeGraduateId) {
        var found = grads.findByCorreoPersonal(email).orElse(null);
        boolean available = (found == null) || (excludeGraduateId != null && found.getId().equals(excludeGraduateId));
        return ResponseEntity.ok(Map.of("available", available));
    }
}

