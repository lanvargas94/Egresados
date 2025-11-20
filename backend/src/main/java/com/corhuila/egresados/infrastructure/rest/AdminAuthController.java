package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.domain.ports.AdminUserRepository;
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
    private final AdminUserRepository adminUserRepository;

    public AdminAuthController(
        AuthenticationManager authManager, 
        JwtUtil jwt,
        AdminUserRepository adminUserRepository
    ) { 
        this.authManager = authManager; 
        this.jwt = jwt;
        this.adminUserRepository = adminUserRepository;
    }

    public record LoginReq(@NotBlank String username, @NotBlank String password) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginReq req) {
        try {
            Authentication auth = authManager.authenticate(new UsernamePasswordAuthenticationToken(req.username(), req.password()));
            
            // Obtener el rol del usuario autenticado
            String role = auth.getAuthorities().stream()
                    .map(a -> a.getAuthority().replace("ROLE_", ""))
                    .findFirst()
                    .orElse("ADMIN");
            
            // Para compatibilidad: si el rol es ADMIN_GENERAL o ADMIN_PROGRAMA, usar ese; si es ADMIN, usar ADMIN_GENERAL
            String roleForToken = role.equals("ADMIN") ? "ADMIN_GENERAL" : role;
            
            String token = jwt.generate(req.username(), Map.of("role", roleForToken));
            
            // Obtener información del usuario admin si existe
            var adminUserOpt = adminUserRepository.findByUsername(req.username());
            if (adminUserOpt.isPresent()) {
                var adminUser = adminUserOpt.get();
                return ResponseEntity.ok(Map.of(
                    "token", token,
                    "role", roleForToken,
                    "userId", adminUser.getId(),
                    "nombre", adminUser.getNombre()
                ));
            }
            
            return ResponseEntity.ok(Map.of("token", token, "role", roleForToken));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body(Map.of("error","Credenciales inválidas. Verifica tu usuario y contraseña."));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error","Error del servidor. Por favor, intenta de nuevo más tarde."));
        }
    }
}

