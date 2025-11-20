package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.application.admin.ManageAdminUserUseCase;
import com.corhuila.egresados.domain.model.AdminUser;
import com.corhuila.egresados.infrastructure.audit.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUsersController {
    private final ManageAdminUserUseCase adminUserUseCase;
    private final AuditService auditService;

    public AdminUsersController(ManageAdminUserUseCase adminUserUseCase, AuditService auditService) {
        this.adminUserUseCase = adminUserUseCase;
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<?> list() {
        try {
            var users = adminUserUseCase.listAll();
            // No devolver passwords
            var usersWithoutPassword = users.stream()
                    .map(u -> {
                        AdminUser uCopy = new AdminUser();
                        uCopy.setId(u.getId());
                        uCopy.setUsername(u.getUsername());
                        uCopy.setNombre(u.getNombre());
                        uCopy.setCorreo(u.getCorreo());
                        uCopy.setRole(u.getRole());
                        uCopy.setProgramasAsignados(u.getProgramasAsignados());
                        uCopy.setActivo(u.isActivo());
                        uCopy.setCreadoEn(u.getCreadoEn());
                        uCopy.setUltimoAcceso(u.getUltimoAcceso());
                        return uCopy;
                    })
                    .toList();
            return ResponseEntity.ok(Map.of("items", usersWithoutPassword));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al listar usuarios: " + ex.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable UUID id) {
        try {
            AdminUser u = adminUserUseCase.getById(id);
            // No devolver password
            AdminUser uCopy = new AdminUser();
            uCopy.setId(u.getId());
            uCopy.setUsername(u.getUsername());
            uCopy.setNombre(u.getNombre());
            uCopy.setCorreo(u.getCorreo());
            uCopy.setRole(u.getRole());
            uCopy.setProgramasAsignados(u.getProgramasAsignados());
            uCopy.setActivo(u.isActivo());
            uCopy.setCreadoEn(u.getCreadoEn());
            uCopy.setUltimoAcceso(u.getUltimoAcceso());
            return ResponseEntity.ok(uCopy);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al obtener usuario: " + ex.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ManageAdminUserUseCase.CreateCommand cmd) {
        try {
            AdminUser created = adminUserUseCase.create(cmd);
            auditService.log("CREATE", "AdminUser", created.getId().toString(), 
                "Usuario admin creado: " + cmd.username());
            // No devolver password
            AdminUser uCopy = new AdminUser();
            uCopy.setId(created.getId());
            uCopy.setUsername(created.getUsername());
            uCopy.setNombre(created.getNombre());
            uCopy.setCorreo(created.getCorreo());
            uCopy.setRole(created.getRole());
            uCopy.setProgramasAsignados(created.getProgramasAsignados());
            uCopy.setActivo(created.isActivo());
            uCopy.setCreadoEn(created.getCreadoEn());
            return ResponseEntity.ok(uCopy);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(400).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al crear usuario: " + ex.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody ManageAdminUserUseCase.UpdateCommand cmd) {
        try {
            var updateCmd = new ManageAdminUserUseCase.UpdateCommand(
                id, cmd.nombre(), cmd.correo(), cmd.role(), 
                cmd.programasAsignados(), cmd.activo(), cmd.newPassword()
            );
            AdminUser updated = adminUserUseCase.update(updateCmd);
            auditService.log("UPDATE", "AdminUser", id.toString(), "Usuario admin actualizado");
            // No devolver password
            AdminUser uCopy = new AdminUser();
            uCopy.setId(updated.getId());
            uCopy.setUsername(updated.getUsername());
            uCopy.setNombre(updated.getNombre());
            uCopy.setCorreo(updated.getCorreo());
            uCopy.setRole(updated.getRole());
            uCopy.setProgramasAsignados(updated.getProgramasAsignados());
            uCopy.setActivo(updated.isActivo());
            uCopy.setCreadoEn(updated.getCreadoEn());
            uCopy.setUltimoAcceso(updated.getUltimoAcceso());
            return ResponseEntity.ok(uCopy);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(400).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al actualizar usuario: " + ex.getMessage()));
        }
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable UUID id) {
        try {
            AdminUser deactivated = adminUserUseCase.deactivate(id);
            auditService.log("DEACTIVATE", "AdminUser", id.toString(), "Usuario admin desactivado");
            // No devolver password
            AdminUser uCopy = new AdminUser();
            uCopy.setId(deactivated.getId());
            uCopy.setUsername(deactivated.getUsername());
            uCopy.setNombre(deactivated.getNombre());
            uCopy.setCorreo(deactivated.getCorreo());
            uCopy.setRole(deactivated.getRole());
            uCopy.setProgramasAsignados(deactivated.getProgramasAsignados());
            uCopy.setActivo(deactivated.isActivo());
            return ResponseEntity.ok(uCopy);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al desactivar usuario: " + ex.getMessage()));
        }
    }
}



