package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.application.admin.ChangeGraduateStatusUseCase;
import com.corhuila.egresados.application.admin.ListGraduatesUseCase;
import com.corhuila.egresados.application.admin.UpdateGraduateUseCase;
import com.corhuila.egresados.domain.model.Graduate;
import com.corhuila.egresados.domain.model.GraduateStatus;
import com.corhuila.egresados.domain.ports.GraduateRepository;
import com.corhuila.egresados.domain.util.PageResult;
import com.corhuila.egresados.infrastructure.audit.AuditService;
import com.corhuila.egresados.infrastructure.mail.EmailService;
import com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringGraduateJpaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/graduates")
@io.swagger.v3.oas.annotations.tags.Tag(name = "09. Administración - Egresados", description = "Gestión completa de egresados: listado, consulta, actualización y cambio de estados")
public class AdminGraduatesController {
    private final ListGraduatesUseCase listUseCase;
    private final UpdateGraduateUseCase updateUseCase;
    private final ChangeGraduateStatusUseCase changeStatusUseCase;
    private final GraduateRepository graduateRepository;
    private final AuditService auditService;
    private final EmailService emailService;
    private final SpringGraduateJpaRepository graduateJpaRepository;

    public AdminGraduatesController(
        ListGraduatesUseCase listUseCase,
        UpdateGraduateUseCase updateUseCase,
        ChangeGraduateStatusUseCase changeStatusUseCase,
        GraduateRepository graduateRepository,
        AuditService auditService,
        EmailService emailService,
        SpringGraduateJpaRepository graduateJpaRepository
    ) {
        this.listUseCase = listUseCase;
        this.updateUseCase = updateUseCase;
        this.changeStatusUseCase = changeStatusUseCase;
        this.graduateRepository = graduateRepository;
        this.auditService = auditService;
        this.emailService = emailService;
        this.graduateJpaRepository = graduateJpaRepository;
    }

    @GetMapping
    @Operation(
        summary = "Listar egresados con filtros",
        description = "Obtiene un listado paginado de egresados con múltiples filtros opcionales: programa, año de graduación, estado, ciudad, identificación y nombre"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Listado de egresados obtenido exitosamente"),
        @ApiResponse(responseCode = "400", description = "Parámetros inválidos"),
        @ApiResponse(responseCode = "500", description = "Error del servidor")
    })
    public ResponseEntity<?> list(
        @Parameter(description = "Número de página (0-indexed)", example = "0")
        @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "Tamaño de página", example = "10")
        @RequestParam(defaultValue = "10") int size,
        @Parameter(description = "Filtrar por programa (opcional)")
        @RequestParam(required = false) String programa,
        @Parameter(description = "Filtrar por año de graduación (opcional)", example = "2020")
        @RequestParam(required = false) Integer anioGraduacion,
        @Parameter(description = "Filtrar por estado: ACTIVO, BLOQUEADO, INACTIVO (opcional)")
        @RequestParam(required = false) String estado,
        @Parameter(description = "Filtrar por ciudad (opcional)")
        @RequestParam(required = false) String ciudad,
        @Parameter(description = "Buscar por número de identificación (opcional)")
        @RequestParam(required = false) String identificacion,
        @Parameter(description = "Buscar por nombre (opcional)")
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
    @Operation(
        summary = "Obtener detalle de egresado",
        description = "Obtiene la información completa de un egresado por su ID"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Egresado encontrado"),
        @ApiResponse(responseCode = "404", description = "Egresado no encontrado"),
        @ApiResponse(responseCode = "500", description = "Error del servidor")
    })
    public ResponseEntity<?> get(
        @Parameter(description = "ID del egresado", required = true, example = "123e4567-e89b-12d3-a456-426614174000")
        @PathVariable UUID id) {
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
    @Operation(
        summary = "Actualizar datos de egresado",
        description = "Actualiza los datos de contacto y observaciones internas de un egresado"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Egresado actualizado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "404", description = "Egresado no encontrado"),
        @ApiResponse(responseCode = "500", description = "Error del servidor")
    })
    public ResponseEntity<?> update(
        @Parameter(description = "ID del egresado", required = true, example = "123e4567-e89b-12d3-a456-426614174000")
        @PathVariable UUID id, 
        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos a actualizar")
        @RequestBody UpdateGraduateUseCase.Command cmd) {
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
    @Operation(
        summary = "Cambiar estado de egresado",
        description = "Cambia el estado de un egresado (ACTIVO, BLOQUEADO, INACTIVO)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Estado cambiado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Estado inválido o datos incorrectos"),
        @ApiResponse(responseCode = "404", description = "Egresado no encontrado"),
        @ApiResponse(responseCode = "500", description = "Error del servidor")
    })
    public ResponseEntity<?> changeStatus(
        @Parameter(description = "ID del egresado", required = true, example = "123e4567-e89b-12d3-a456-426614174000")
        @PathVariable UUID id, 
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Objeto con el campo 'estado' (ACTIVO, BLOQUEADO, INACTIVO)",
            required = true
        )
        @RequestBody Map<String, String> body) {
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

    @PostMapping("/bulk-email")
    @io.swagger.v3.oas.annotations.Operation(
        summary = "Enviar correo masivo a todos los egresados",
        description = "Envía un correo electrónico HTML a todos los egresados con correo verificado. " +
                     "Soporta adjuntos opcionales: documento (PDF, DOC, DOCX) e imagen (JPG, PNG). " +
                     "La imagen se embebe inline en el HTML del correo. " +
                     "Tamaño máximo por archivo: 2MB. " +
                     "Retorna estadísticas de envío (total, exitosos, fallidos)."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Correo masivo enviado exitosamente",
            content = @io.swagger.v3.oas.annotations.media.Content(
                mediaType = "application/json",
                schema = @io.swagger.v3.oas.annotations.media.Schema(implementation = java.util.Map.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Datos inválidos: asunto/descripción vacíos, archivo muy grande (>2MB), formato de imagen inválido"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500",
            description = "Error del servidor al procesar el correo masivo"
        )
    })
    public ResponseEntity<?> sendBulkEmail(
        @io.swagger.v3.oas.annotations.Parameter(description = "Asunto del correo (obligatorio)", required = true, example = "Bienvenido a Corhuila")
        @RequestParam("asunto") String asunto,
        @io.swagger.v3.oas.annotations.Parameter(description = "Descripción/contenido del correo en HTML o texto plano (obligatorio)", required = true, example = "Iniciamos semestre")
        @RequestParam("descripcion") String descripcion,
        @io.swagger.v3.oas.annotations.Parameter(description = "Documento adjunto opcional (PDF, DOC, DOCX, máx. 2MB)")
        @RequestParam(value = "documento", required = false) MultipartFile documento,
        @io.swagger.v3.oas.annotations.Parameter(description = "Imagen opcional para embeberse inline en el HTML (JPG, PNG, máx. 2MB)")
        @RequestParam(value = "imagen", required = false) MultipartFile imagen
    ) {
        try {
            if (asunto == null || asunto.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El asunto es obligatorio"));
            }
            if (descripcion == null || descripcion.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "La descripción es obligatoria"));
            }

            // Obtener todos los egresados con correo personal verificado
            List<com.corhuila.egresados.infrastructure.persistence.jpa.entity.GraduateEntity> graduates = 
                graduateJpaRepository.findAll().stream()
                    .filter(g -> g.getCorreoPersonal() != null && 
                                !g.getCorreoPersonal().trim().isEmpty() && 
                                g.isCorreoVerificado())
                    .toList();

            if (graduates.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No hay egresados con correo verificado"));
            }

            // Guardar archivos temporales si existen
            File tempDocument = null;
            File tempImage = null;
            String userDir = System.getProperty("user.dir");
            Path baseDir = Paths.get(userDir != null && !userDir.equals("/app") ? userDir : "/app");
            Path tempDir = baseDir.resolve("uploads").resolve("temp");
            Files.createDirectories(tempDir);

            if (documento != null && !documento.isEmpty()) {
                if (documento.getSize() > 2 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body(Map.of("error", "El documento no puede ser mayor a 2MB"));
                }
                // Usar el nombre original del archivo si está disponible, o generar uno
                String originalName = documento.getOriginalFilename();
                if (originalName == null || originalName.trim().isEmpty()) {
                    originalName = "documento_adjunto";
                }
                // Limpiar el nombre del archivo para evitar caracteres problemáticos
                originalName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
                String docFilename = "doc_" + UUID.randomUUID() + "_" + originalName;
                tempDocument = tempDir.resolve(docFilename).toFile();
                Files.copy(documento.getInputStream(), tempDocument.toPath(), 
                          java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                // Verificar que el archivo se copió correctamente
                if (!tempDocument.exists() || tempDocument.length() == 0) {
                    return ResponseEntity.status(500).body(Map.of("error", "Error al guardar el documento"));
                }
            }

            if (imagen != null && !imagen.isEmpty()) {
                String contentType = imagen.getContentType();
                if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png"))) {
                    if (tempDocument != null) tempDocument.delete();
                    return ResponseEntity.badRequest().body(Map.of("error", "La imagen debe ser JPG o PNG"));
                }
                if (imagen.getSize() > 2 * 1024 * 1024) {
                    if (tempDocument != null) tempDocument.delete();
                    return ResponseEntity.badRequest().body(Map.of("error", "La imagen no puede ser mayor a 2MB"));
                }
                String extension = contentType.equals("image/png") ? ".png" : ".jpg";
                String imgFilename = "img_" + UUID.randomUUID() + extension;
                tempImage = tempDir.resolve(imgFilename).toFile();
                Files.copy(imagen.getInputStream(), tempImage.toPath(), 
                          java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                // Verificar que el archivo se copió correctamente
                if (!tempImage.exists() || tempImage.length() == 0) {
                    if (tempDocument != null) tempDocument.delete();
                    return ResponseEntity.status(500).body(Map.of("error", "Error al guardar la imagen"));
                }
            }

            // Construir HTML del correo
            String htmlBody = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                    "<h2 style='color: #00a859; margin-top: 0;'>" + asunto + "</h2>" +
                    "<div style='line-height: 1.6; color: #333;'>" + 
                    descripcion.replace("\n", "<br>") + 
                    "</div>" +
                    (tempImage != null ? "<br><img src='cid:image' style='max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0;' />" : "") +
                    "<hr style='margin: 20px 0; border: none; border-top: 1px solid #eee;' />" +
                    "<p style='color: #666; font-size: 12px;'>Plataforma de Egresados CORHUILA</p>" +
                    "</div>";

            // Enviar correos
            int sent = 0;
            int failed = 0;
            for (var graduate : graduates) {
                try {
                    String personalizedBody = htmlBody;
                    if (graduate.getNombreLegal() != null && !graduate.getNombreLegal().trim().isEmpty()) {
                        personalizedBody = htmlBody.replace("{nombre}", graduate.getNombreLegal());
                    } else {
                        personalizedBody = htmlBody.replace("{nombre}", "");
                    }
                    
                    emailService.sendHtmlWithAttachments(
                        graduate.getCorreoPersonal(),
                        asunto,
                        personalizedBody,
                        tempDocument,
                        tempImage
                    );
                    sent++;
                } catch (Exception e) {
                    failed++;
                    System.err.println("Error enviando correo a " + graduate.getCorreoPersonal() + ": " + e.getMessage());
                }
            }

            // Limpiar archivos temporales
            if (tempDocument != null) tempDocument.delete();
            if (tempImage != null) tempImage.delete();

            auditService.log("BULK_EMAIL", "Graduate", "ALL", 
                "Correo masivo enviado: " + sent + " exitosos, " + failed + " fallidos");

            return ResponseEntity.ok(Map.of(
                "success", true,
                "total", graduates.size(),
                "sent", sent,
                "failed", failed,
                "message", "Correo enviado a " + sent + " de " + graduates.size() + " egresados"
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al enviar correo masivo: " + ex.getMessage()));
        }
    }
}






