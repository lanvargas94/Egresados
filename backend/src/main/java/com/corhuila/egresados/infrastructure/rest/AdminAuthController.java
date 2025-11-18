package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.infrastructure.security.JwtUtil;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {
    private final AuthenticationManager authManager;
    private final JwtUtil jwt;

    public AdminAuthController(AuthenticationManager authManager, JwtUtil jwt) { this.authManager = authManager; this.jwt = jwt; }

    public record LoginReq(@NotBlank String username, @NotBlank String password) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginReq req) {
        try {
            Authentication auth = authManager.authenticate(new UsernamePasswordAuthenticationToken(req.username(), req.password()));
            String token = jwt.generate(req.username(), Map.of("role", "ADMIN"));
            return ResponseEntity.ok(Map.of("token", token));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body(Map.of("error","Credenciales inválidas. Verifica tu usuario y contraseña."));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error","Error del servidor. Por favor, intenta de nuevo más tarde."));
        }
    }
}

