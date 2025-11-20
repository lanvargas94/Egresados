package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.application.admin.ManageBannerUseCase;
import com.corhuila.egresados.domain.model.Banner;
import com.corhuila.egresados.infrastructure.audit.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/banners")
public class AdminBannersController {
    private final ManageBannerUseCase bannerUseCase;
    private final AuditService auditService;

    public AdminBannersController(ManageBannerUseCase bannerUseCase, AuditService auditService) {
        this.bannerUseCase = bannerUseCase;
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required = false, defaultValue = "false") boolean activos) {
        try {
            var banners = activos ? bannerUseCase.listActivos() : bannerUseCase.listAll();
            return ResponseEntity.ok(Map.of("items", banners));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al listar banners: " + ex.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable UUID id) {
        try {
            Banner b = bannerUseCase.listAll().stream()
                    .filter(banner -> banner.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Banner no encontrado"));
            return ResponseEntity.ok(b);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al obtener banner: " + ex.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ManageBannerUseCase.CreateCommand cmd) {
        try {
            Banner created = bannerUseCase.create(cmd);
            auditService.log("CREATE", "Banner", created.getId().toString(), "Banner creado: " + cmd.titulo());
            return ResponseEntity.ok(created);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al crear banner: " + ex.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody ManageBannerUseCase.UpdateCommand cmd) {
        try {
            var updateCmd = new ManageBannerUseCase.UpdateCommand(
                id, cmd.titulo(), cmd.subtitulo(), cmd.imagenUrl(), 
                cmd.enlaceAccion(), cmd.orden(), cmd.activo()
            );
            Banner updated = bannerUseCase.update(updateCmd);
            auditService.log("UPDATE", "Banner", id.toString(), "Banner actualizado");
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al actualizar banner: " + ex.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        try {
            bannerUseCase.delete(id);
            auditService.log("DELETE", "Banner", id.toString(), "Banner eliminado");
            return ResponseEntity.ok(Map.of("ok", true));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al eliminar banner: " + ex.getMessage()));
        }
    }
}



