package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.application.IdentifyGraduateUseCase;
import com.corhuila.egresados.infrastructure.rest.dto.IdentifyRequest;
import com.corhuila.egresados.infrastructure.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "01. Autenticación de Egresados", description = "Identificación de egresados y autenticación mediante OTP (One-Time Password)")
public class AuthController {
    private final IdentifyGraduateUseCase identifyGraduateUseCase;
    private final JwtUtil jwtUtil;

    public AuthController(IdentifyGraduateUseCase identifyGraduateUseCase, JwtUtil jwtUtil) {
        this.identifyGraduateUseCase = identifyGraduateUseCase;
        this.jwtUtil = jwtUtil;
    }

    @Operation(
            summary = "Identificar egresado",
            description = "Identifica un egresado por su número de identificación. Retorna el estado del egresado y un token JWT si está activo."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Identificación exitosa",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = """
                                    {
                                        "status": "panel",
                                        "graduateId": "123e4567-e89b-12d3-a456-426614174000",
                                        "nombre": "Juan Pérez García",
                                        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                    }
                                    """)
                    )
            ),
            @ApiResponse(responseCode = "500", description = "Error del servidor")
    })
    @PostMapping("/identify")
    public ResponseEntity<?> identify(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Número de identificación del egresado",
                    required = true,
                    content = @Content(
                            examples = @ExampleObject(value = """
                                    {
                                        "numeroIdentificacion": "1234567890"
                                    }
                                    """)
                    )
            )
            @Valid @RequestBody IdentifyRequest request) {
        try {
        var res = identifyGraduateUseCase.handle(request.numeroIdentificacion);
        Map<String, Object> body = new HashMap<>();
        body.put("status", res.status().name().toLowerCase());
            if (res.graduateId() != null) {
                body.put("graduateId", res.graduateId().toString());
                // Generar token JWT para permitir acceso al perfil
                String token = jwtUtil.generate(res.graduateId().toString(), Map.of("role", "GRAD"));
                body.put("token", token);
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

