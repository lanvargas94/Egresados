package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.domain.ports.GraduateRepository;
import com.corhuila.egresados.infrastructure.auth.GraduateOtpEntity;
import com.corhuila.egresados.infrastructure.auth.GraduateOtpRepository;
import com.corhuila.egresados.infrastructure.mail.EmailService;
import com.corhuila.egresados.infrastructure.security.JwtUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "01. Autenticación de Egresados", description = "Identificación de egresados y autenticación mediante OTP (One-Time Password)")
public class GraduateAuthController {
    private final GraduateRepository grads;
    private final GraduateOtpRepository otps;
    private final EmailService email;
    private final JwtUtil jwt;

    public GraduateAuthController(GraduateRepository grads, GraduateOtpRepository otps, EmailService email, JwtUtil jwt) {
        this.grads = grads; this.otps = otps; this.email = email; this.jwt = jwt;
    }

    public record OtpRequest(@NotBlank String identificacion) {}
    public record OtpLogin(@NotBlank String identificacion, @NotBlank String code) {}

    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@RequestBody OtpRequest req) {
        // Siempre responder 200 para no filtrar existencia (anonimización)
        var g = grads.findByIdentificacion(req.identificacion()).orElse(null);
        if (g == null || g.getCorreoPersonal() == null || g.getCorreoPersonal().isBlank()) {
            return ResponseEntity.ok(Map.of("ok", true));
        }
        var last = otps.findTopByGraduateIdOrderByCreatedAtDesc(g.getId()).orElse(null);
        if (last != null && last.getCreatedAt().isAfter(OffsetDateTime.now().minusSeconds(60))) {
            return ResponseEntity.ok(Map.of("ok", true));
        }
        long countHour = otps.countByGraduateIdAndCreatedAtAfter(g.getId(), OffsetDateTime.now().minusHours(1));
        if (countHour >= 5) {
            return ResponseEntity.ok(Map.of("ok", true));
        }
        String code = String.format("%06d", (int)(Math.random()*1000000));
        GraduateOtpEntity e = new GraduateOtpEntity();
        e.setGraduateId(g.getId());
        e.setCode(code);
        e.setCreatedAt(OffsetDateTime.now());
        e.setExpiresAt(OffsetDateTime.now().plusMinutes(10));
        otps.save(e);
        try { email.sendHtml(g.getCorreoPersonal(), "Tu código OTP – Egresados CORHUILA", "<p>Tu código de ingreso es <b>"+code+"</b>. Vence en 10 minutos.</p>"); } catch (Exception ignored) {}
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/login-otp")
    public ResponseEntity<?> loginOtp(@RequestBody OtpLogin req) {
        var g = grads.findByIdentificacion(req.identificacion()).orElse(null);
        if (g == null) return ResponseEntity.status(401).body(Map.of("error","Identificación inválida"));
        var last = otps.findTopByGraduateIdOrderByCreatedAtDesc(g.getId()).orElse(null);
        if (last == null) { return ResponseEntity.status(401).body(Map.of("error","OTP inválido o expirado")); }
        if (last.getConsumedAt() != null || last.getExpiresAt().isBefore(OffsetDateTime.now())) {
            return ResponseEntity.status(401).body(Map.of("error","OTP inválido o expirado"));
        }
        if (last.getAttempts() >= 5) { return ResponseEntity.status(401).body(Map.of("error","OTP inválido o expirado")); }
        if (!last.getCode().equals(req.code())) {
            last.setAttempts(last.getAttempts()+1); otps.save(last);
            return ResponseEntity.status(401).body(Map.of("error","OTP inválido o expirado"));
        }
        last.setConsumedAt(OffsetDateTime.now()); otps.save(last);
        String token = jwt.generate(g.getId().toString(), Map.of("role","GRAD"));
        return ResponseEntity.ok(Map.of("token", token, "graduateId", g.getId(), "nombre", g.getNombreLegal()));
    }
}
