package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.domain.model.EmploymentStatus;
import com.corhuila.egresados.domain.model.Graduate;
import com.corhuila.egresados.domain.ports.GraduateRepository;
import com.corhuila.egresados.infrastructure.profile.EmailConfirmation;
import com.corhuila.egresados.infrastructure.profile.EmailConfirmationRepository;
import com.corhuila.egresados.infrastructure.profile.ProfileChangeLog;
import com.corhuila.egresados.infrastructure.profile.ProfileChangeLogRepository;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/profile")
@org.springframework.web.bind.annotation.CrossOrigin(origins = "${FRONT_ORIGIN:http://localhost:4200}")
public class ProfileController {
    private final GraduateRepository grads;
    private final ProfileChangeLogRepository logs;
    private final EmailConfirmationRepository emailConfs;
    private final com.corhuila.egresados.infrastructure.mail.EmailService emailService;
    private final com.corhuila.egresados.infrastructure.catalog.CatalogService catalogService;

    public ProfileController(GraduateRepository grads, ProfileChangeLogRepository logs, EmailConfirmationRepository emailConfs,
                             com.corhuila.egresados.infrastructure.mail.EmailService emailService,
                             com.corhuila.egresados.infrastructure.catalog.CatalogService catalogService) {
        this.grads = grads; this.logs = logs; this.emailConfs = emailConfs; this.emailService = emailService; this.catalogService = catalogService;
    }

    @GetMapping
    public ResponseEntity<?> get(@RequestParam UUID graduateId) {
        Graduate g = grads.findById(graduateId).orElseThrow();
        return ResponseEntity.ok(g);
    }

    public record UpdateReq(UUID graduateId,
                            @Email String correoPersonal,
                            String pais, String ciudad, String telefonoMovil,
                            EmploymentStatus situacionLaboral, String industria, String empresa, String cargo,
                            Boolean aporteMentoria, Boolean aporteOfertas, Boolean aporteConferencista,
                            Boolean intNoticiasFacultad, Boolean intEventosCiudad, Boolean intOfertasSector, Boolean intPosgrados) {}

    @PutMapping
    public ResponseEntity<?> update(@RequestBody UpdateReq req) {
        try {
        Graduate g = grads.findById(req.graduateId()).orElseThrow();
        Map<String, String> changes = new LinkedHashMap<>();

        if (req.correoPersonal() != null && !req.correoPersonal().equalsIgnoreCase(g.getCorreoPersonal())) {
            // reconfirmation RN-P02
            EmailConfirmation conf = new EmailConfirmation();
            conf.setGraduateId(g.getId());
            conf.setNewEmail(req.correoPersonal());
            conf.setToken(UUID.randomUUID().toString());
            conf.setCreatedAt(OffsetDateTime.now());
            emailConfs.save(conf);
            // Enviar correo de confirmación
            try { emailService.sendEmailConfirmation(conf.getNewEmail(), conf.getToken(), g.getNombreLegal()); } catch (Exception ex) { /* loggear en prod */ }
            changes.put("correoPersonal", "pendiente de confirmación");
        }
        boolean paisChanged = false;
        if (req.pais() != null && !Objects.equals(req.pais(), g.getPais())) {
            if (!catalogService.isValidCountry(req.pais())) {
                throw new IllegalArgumentException("País no pertenece al catálogo (RN-V03)");
            }
            changes.put("pais", safe(g.getPais()) + " -> " + req.pais()); g.setPais(req.pais()); paisChanged = true;
        }
        if (paisChanged) {
            // RN-P03: reiniciar prefijo y lista de ciudades
            if (req.ciudad() == null || req.ciudad().isBlank()) { g.setCiudad(null); changes.put("ciudad","reiniciada por cambio de país"); }
            if (req.telefonoMovil() == null || req.telefonoMovil().isBlank()) { g.setTelefonoMovilE164(null); changes.put("telefono","reiniciado por cambio de país"); }
        }
        if (req.ciudad() != null && !Objects.equals(req.ciudad(), g.getCiudad())) {
            String countryForCity = g.getPais();
            if (req.pais() != null) countryForCity = req.pais();
            if (!catalogService.isValidCity(countryForCity, req.ciudad())) {
                throw new IllegalArgumentException("Ciudad no pertenece al catálogo del país (RN-V03)");
            }
            changes.put("ciudad", safe(g.getCiudad()) + " -> " + req.ciudad()); g.setCiudad(req.ciudad());
        }
        if (req.telefonoMovil() != null && !Objects.equals(req.telefonoMovil(), g.getTelefonoMovilE164())) {
            String countryForPhone = g.getPais();
            if (req.pais() != null) countryForPhone = req.pais();
            try {
                String normalized = catalogService.toE164OrThrow(req.telefonoMovil(), countryForPhone);
                changes.put("telefono", safe(g.getTelefonoMovilE164()) + " -> " + normalized);
                g.setTelefonoMovilE164(normalized);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Teléfono inválido: " + e.getMessage());
            }
        }
        if (req.situacionLaboral() != null && req.situacionLaboral() != g.getSituacionLaboral()) { changes.put("situacionLaboral", safe(g.getSituacionLaboral()) + " -> " + req.situacionLaboral()); g.setSituacionLaboral(req.situacionLaboral()); }
        if (updateStr(g::getIndustria, g::setIndustria, req.industria(), changes, "industria")) {}
        if (updateStr(g::getEmpresa, g::setEmpresa, req.empresa(), changes, "empresa")) {}
        if (updateStr(g::getCargo, g::setCargo, req.cargo(), changes, "cargo")) {}
        if (updateBool(g::getAporteMentoria, g::setAporteMentoria, req.aporteMentoria(), changes, "aporteMentoria")) {}
        if (updateBool(g::getAporteOfertas, g::setAporteOfertas, req.aporteOfertas(), changes, "aporteOfertas")) {}
        if (updateBool(g::getAporteConferencista, g::setAporteConferencista, req.aporteConferencista(), changes, "aporteConferencista")) {}
        if (updateBool(g::getIntNoticiasFacultad, g::setIntNoticiasFacultad, req.intNoticiasFacultad(), changes, "intNoticiasFacultad")) {}
        if (updateBool(g::getIntEventosCiudad, g::setIntEventosCiudad, req.intEventosCiudad(), changes, "intEventosCiudad")) {}
        if (updateBool(g::getIntOfertasSector, g::setIntOfertasSector, req.intOfertasSector(), changes, "intOfertasSector")) {}
        if (updateBool(g::getIntPosgrados, g::setIntPosgrados, req.intPosgrados(), changes, "intPosgrados")) {}

        g.setActualizadoEn(OffsetDateTime.now());
        grads.save(g);

        if (!changes.isEmpty()) {
            ProfileChangeLog log = new ProfileChangeLog();
            log.setGraduateId(g.getId());
            log.setCreatedAt(OffsetDateTime.now());
            log.setSummary(String.join("; ", changes.entrySet().stream().map(e -> e.getKey()+": "+e.getValue()).toList()));
            logs.save(log);
        }

        return ResponseEntity.ok(Map.of(
                "ok", true,
                "requiresEmailConfirmation", changes.containsKey("correoPersonal")));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(400).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error del servidor. Por favor, intenta de nuevo más tarde."));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> history(@RequestParam UUID graduateId) {
        var items = logs.findByGraduateIdOrderByCreatedAtDesc(graduateId, PageRequest.of(0, 12));
        return ResponseEntity.ok(items);
    }

    @PostMapping("/confirm-email")
    public ResponseEntity<?> confirmEmail(@RequestParam String token) {
        var conf = emailConfs.findByToken(token).orElseThrow();
        var grad = grads.findById(conf.getGraduateId()).orElseThrow();
        // Unicidad de correo (RN-V02)
        grads.findByCorreoPersonal(conf.getNewEmail()).ifPresent(other -> {
            if (!other.getId().equals(grad.getId())) {
                throw new IllegalArgumentException("Correo ya está en uso por otro usuario (RN-V02)");
            }
        });
        grad.setCorreoPersonal(conf.getNewEmail());
        grad.setCorreoVerificado(true);
        grad.setActualizadoEn(OffsetDateTime.now());
        grads.save(grad);
        conf.setConfirmedAt(OffsetDateTime.now());
        emailConfs.save(conf);
        ProfileChangeLog log = new ProfileChangeLog();
        log.setGraduateId(grad.getId());
        log.setCreatedAt(OffsetDateTime.now());
        log.setSummary("correoPersonal confirmado");
        logs.save(log);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/resend-confirmation")
    public ResponseEntity<?> resendConfirmation(@RequestParam UUID graduateId) {
        var grad = grads.findById(graduateId).orElseThrow();
        String targetEmail = null;
        var pendingOpt = emailConfs.findTopByGraduateIdAndConfirmedAtIsNullOrderByCreatedAtDesc(graduateId);
        if (pendingOpt.isPresent()) {
            targetEmail = pendingOpt.get().getNewEmail();
        } else if (!grad.isCorreoVerificado() && grad.getCorreoPersonal() != null && !grad.getCorreoPersonal().isBlank()) {
            targetEmail = grad.getCorreoPersonal();
        }
        if (targetEmail == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No hay correo pendiente de confirmación"));
        }
        EmailConfirmation conf = new EmailConfirmation();
        conf.setGraduateId(grad.getId());
        conf.setNewEmail(targetEmail);
        conf.setToken(UUID.randomUUID().toString());
        conf.setCreatedAt(OffsetDateTime.now());
        emailConfs.save(conf);
        try { emailService.sendEmailConfirmation(targetEmail, conf.getToken(), grad.getNombreLegal()); } catch (Exception ex) { /* loggear */ }
        return ResponseEntity.ok(Map.of("ok", true));
    }

    private boolean updateStr(java.util.function.Supplier<String> getter, java.util.function.Consumer<String> setter, String newVal, Map<String,String> changes, String label) {
        if (newVal != null && !Objects.equals(newVal, getter.get())) { changes.put(label, safe(getter.get()) + " -> " + newVal); setter.accept(newVal); return true; } return false;
    }
    private boolean updateBool(java.util.function.Supplier<Boolean> getter, java.util.function.Consumer<Boolean> setter, Boolean newVal, Map<String,String> changes, String label) {
        if (newVal != null && !Objects.equals(newVal, getter.get())) { changes.put(label, safe(getter.get()) + " -> " + newVal); setter.accept(newVal); return true; } return false;
    }
    private String safe(Object v) { return v == null ? "" : String.valueOf(v); }
}
