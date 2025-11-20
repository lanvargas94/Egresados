package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.application.admin.ChangeGraduateStatusUseCase;
import com.corhuila.egresados.application.admin.ListGraduatesUseCase;
import com.corhuila.egresados.application.admin.UpdateGraduateUseCase;
import com.corhuila.egresados.domain.model.Graduate;
import com.corhuila.egresados.domain.model.GraduateStatus;
import com.corhuila.egresados.domain.ports.GraduateRepository;
import com.corhuila.egresados.domain.util.PageResult;
import com.corhuila.egresados.infrastructure.audit.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/graduates")
public class AdminGraduatesController {
    private final ListGraduatesUseCase listUseCase;
    private final UpdateGraduateUseCase updateUseCase;
    private final ChangeGraduateStatusUseCase changeStatusUseCase;
    private final GraduateRepository graduateRepository;
    private final AuditService auditService;

    public AdminGraduatesController(
        ListGraduatesUseCase listUseCase,
        UpdateGraduateUseCase updateUseCase,
        ChangeGraduateStatusUseCase changeStatusUseCase,
        GraduateRepository graduateRepository,
        AuditService auditService
    ) {
        this.listUseCase = listUseCase;
        this.updateUseCase = updateUseCase;
        this.changeStatusUseCase = changeStatusUseCase;
        this.graduateRepository = graduateRepository;
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<?> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String programa,
        @RequestParam(required = false) Integer anioGraduacion,
        @RequestParam(required = false) String estado,
        @RequestParam(required = false) String ciudad,
        @RequestParam(required = false) String identificacion,
        @RequestParam(required = false) String nombre
    ) {
        try {
            GraduateStatus estadoEnum = null;
            if (estado != null && !estado.isBlank()) {
                try {
                    estadoEnum = GraduateStatus.valueOf(estado.toUpperCase());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Estado inválido: " + estado));
                }
            }
            
            var filters = new ListGraduatesUseCase.Filters(
                programa, anioGraduacion, estadoEnum, ciudad, identificacion, nombre
            );
            
            PageResult<Graduate> result = listUseCase.handle(filters, page, size);
            return ResponseEntity.ok(Map.of(
                "items", result.getItems(),
                "total", result.getTotal(),
                "page", result.getPage(),
                "size", result.getSize()
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al listar egresados: " + ex.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable UUID id) {
        try {
            Graduate g = graduateRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Egresado no encontrado"));
            return ResponseEntity.ok(g);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al obtener egresado: " + ex.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody UpdateGraduateUseCase.Command cmd) {
        try {
            var command = new UpdateGraduateUseCase.Command(
                id, cmd.correoPersonal(), cmd.pais(), cmd.ciudad(), 
                cmd.telefonoMovil(), cmd.observacionesInternas(), cmd.estado()
            );
            Graduate updated = updateUseCase.handle(command);
            auditService.log("UPDATE", "Graduate", id.toString(), "Actualización de datos de contacto");
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(400).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al actualizar egresado: " + ex.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> changeStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        try {
            String statusStr = body.get("estado");
            if (statusStr == null || statusStr.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Estado requerido"));
            }
            GraduateStatus newStatus = GraduateStatus.valueOf(statusStr.toUpperCase());
            Graduate updated = changeStatusUseCase.handle(id, newStatus);
            auditService.log("CHANGE_STATUS", "Graduate", id.toString(), 
                "Cambio de estado a: " + newStatus.name());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(400).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al cambiar estado: " + ex.getMessage()));
        }
    }
}



