package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.domain.model.News;
import com.corhuila.egresados.infrastructure.persistence.jpa.entity.NewsEntity;
import com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringNewsJpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/news")
public class AdminNewsController {
    private final SpringNewsJpaRepository jpa;
    private final com.corhuila.egresados.infrastructure.audit.AuditService audit;

    public AdminNewsController(SpringNewsJpaRepository jpa, com.corhuila.egresados.infrastructure.audit.AuditService audit) {
        this.jpa = jpa; this.audit = audit;
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "10") int size,
                                  @RequestParam(required = false) String estado) {
        try {
            String estadoStr = null;
            if (estado != null && !estado.isBlank()) {
                try {
                    // Validar que el estado sea válido
                    News.Status.valueOf(estado.toUpperCase());
                    estadoStr = estado.toUpperCase();
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(java.util.Map.of("error", "Estado inválido: " + estado));
                }
            }
            var pg = jpa.adminList(estadoStr, org.springframework.data.domain.PageRequest.of(page, size));
            return ResponseEntity.ok(java.util.Map.of("items", pg.getContent(), "total", pg.getTotalElements(), "page", page, "size", size));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error al cargar noticias: " + ex.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody NewsEntity n) {
        try {
            if (n.getId() == null) n.setId(UUID.randomUUID());
            if (n.getEstado() == null) n.setEstado(News.Status.BORRADOR);
            // Para borradores, solo validar título mínimo (los demás campos se validan al publicar)
            if (isBlank(n.getTitulo())) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "El título es obligatorio"));
            }
            // Validar longitud del resumen si está presente
            if (n.getResumen() != null && n.getResumen().length() > 500) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "El resumen no puede exceder 500 caracteres"));
            }
            var saved = jpa.save(n);
            audit.log("CREATE","News", saved.getId().toString(), saved.getTitulo() != null ? saved.getTitulo() : "Sin título");
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error al crear noticia: " + ex.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody NewsEntity n) {
        try {
            var existing = jpa.findById(id);
            if (existing.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            var existingEntity = existing.get();
            n.setId(id);
            // Preservar el estado si no se envía
            if (n.getEstado() == null) {
                n.setEstado(existingEntity.getEstado());
            }
            // Para actualizar borradores, solo validar título mínimo
            if (isBlank(n.getTitulo())) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "El título es obligatorio"));
            }
            // Validar longitud del resumen si está presente
            if (n.getResumen() != null && n.getResumen().length() > 500) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "El resumen no puede exceder 500 caracteres"));
            }
            var saved = jpa.save(n);
            audit.log("UPDATE","News", saved.getId().toString(), saved.getTitulo() != null ? saved.getTitulo() : "Sin título");
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error al actualizar noticia: " + ex.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable UUID id) { return ResponseEntity.ok(jpa.findById(id).orElseThrow()); }

    @PostMapping("/{id}/schedule")
    public ResponseEntity<?> schedule(@PathVariable UUID id, @RequestParam String fecha) {
        try {
            var n = jpa.findById(id).orElseThrow();
            // Validar campos obligatorios antes de programar
            if (isBlank(n.getTitulo()) || isBlank(n.getResumen()) || isBlank(n.getCuerpoHtml())) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", 
                    "Título, resumen y contenido son obligatorios para programar"));
            }
            OffsetDateTime fechaPub = OffsetDateTime.parse(fecha);
            OffsetDateTime ahora = OffsetDateTime.now();
            // Validar que la fecha sea futura
            if (fechaPub.isBefore(ahora) || fechaPub.isEqual(ahora)) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", 
                    "La fecha de publicación debe ser futura para programar"));
            }
            n.setFechaPublicacion(fechaPub);
            n.setEstado(News.Status.PROGRAMADA);
            var saved = jpa.save(n);
            audit.log("SCHEDULE","News", saved.getId().toString(), saved.getTitulo());
            return ResponseEntity.ok(saved);
        } catch (java.time.format.DateTimeParseException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Formato de fecha inválido"));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error al programar noticia: " + ex.getMessage()));
        }
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<?> publish(@PathVariable UUID id) {
        try {
            var n = jpa.findById(id).orElseThrow();
            // Validar campos obligatorios antes de publicar
            if (isBlank(n.getTitulo())) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "El título es obligatorio para publicar"));
            }
            if (isBlank(n.getResumen())) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "El resumen es obligatorio para publicar"));
            }
            if (isBlank(n.getCuerpoHtml())) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "El contenido es obligatorio para publicar"));
            }
            n.setEstado(News.Status.PUBLICADA);
            // Si no tiene fecha de publicación, establecerla ahora
            if (n.getFechaPublicacion() == null) {
                n.setFechaPublicacion(OffsetDateTime.now());
            }
            var saved = jpa.save(n);
            audit.log("PUBLISH","News", saved.getId().toString(), saved.getTitulo());
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error al publicar noticia: " + ex.getMessage()));
        }
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<?> archive(@PathVariable UUID id) {
        var n = jpa.findById(id).orElseThrow();
        n.setEstado(News.Status.ARCHIVADA);
        var saved = jpa.save(n);
        audit.log("ARCHIVE","News", saved.getId().toString(), saved.getTitulo());
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        var n = jpa.findById(id).orElseThrow();
        if (n.getImagenUrl() != null && n.getImagenUrl().startsWith("/uploads/")) {
            java.nio.file.Path old = java.nio.file.Paths.get("uploads").resolve(n.getImagenUrl().substring("/uploads/".length()));
            try { java.nio.file.Files.deleteIfExists(old); } catch (Exception ignored) {}
        }
        if (n.getAdjuntoUrl() != null && n.getAdjuntoUrl().startsWith("/uploads/")) {
            java.nio.file.Path old = java.nio.file.Paths.get("uploads").resolve(n.getAdjuntoUrl().substring("/uploads/".length()));
            try { java.nio.file.Files.deleteIfExists(old); } catch (Exception ignored) {}
        }
        jpa.delete(n);
        audit.log("DELETE","News", id.toString(), n.getTitulo());
        return ResponseEntity.ok(java.util.Map.of("ok", true));
    }

    @PostMapping("/{id}/upload-image")
    public ResponseEntity<?> uploadImage(@PathVariable java.util.UUID id, @org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        if (file.getSize() > 10 * 1024 * 1024) return ResponseEntity.badRequest().body(java.util.Map.of("error","Archivo > 10MB"));
        String ct = file.getContentType();
        if (ct == null || !(ct.equals("image/jpeg") || ct.equals("image/png"))) return ResponseEntity.badRequest().body(java.util.Map.of("error","Solo JPG/PNG"));
        var n = jpa.findById(id).orElseThrow();
        // Reemplazo: borrar archivo anterior si existe
        if (n.getImagenUrl() != null && n.getImagenUrl().startsWith("/uploads/")) {
            java.nio.file.Path old = java.nio.file.Paths.get("uploads").resolve(n.getImagenUrl().substring("/uploads/".length()));
            try { java.nio.file.Files.deleteIfExists(old); } catch (Exception ignored) {}
        }
        java.nio.file.Path dir = java.nio.file.Paths.get("uploads","news","images");
        java.nio.file.Files.createDirectories(dir);
        String ext = ct.equals("image/png")?".png":".jpg";
        String filename = id+"_"+System.currentTimeMillis()+ext;
        java.nio.file.Path path = dir.resolve(filename);
        file.transferTo(path.toFile());
        n.setImagenUrl("/uploads/news/images/"+filename);
        var saved = jpa.save(n);
        audit.log("UPLOAD_IMAGE","News", saved.getId().toString(), filename);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/upload-attachment")
    public ResponseEntity<?> uploadAttachment(@PathVariable java.util.UUID id, @org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        // Validar tamaño máximo: 5 MB
        long maxSize = 5 * 1024 * 1024; // 5 MB
        if (file.getSize() > maxSize) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error","El archivo excede el tamaño máximo de 5 MB"));
        }
        
        // Validar extensiones permitidas: .pdf, .doc, .docx
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error","Nombre de archivo inválido"));
        }
        String lowerFilename = originalFilename.toLowerCase();
        boolean isValidExtension = lowerFilename.endsWith(".pdf") || 
                                   lowerFilename.endsWith(".doc") || 
                                   lowerFilename.endsWith(".docx");
        
        if (!isValidExtension) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error","Solo se permiten archivos .pdf, .doc o .docx"));
        }
        
        var n = jpa.findById(id).orElseThrow();
        // Reemplazo: borrar archivo anterior si existe
        if (n.getAdjuntoUrl() != null && n.getAdjuntoUrl().startsWith("/uploads/")) {
            java.nio.file.Path old = java.nio.file.Paths.get("uploads").resolve(n.getAdjuntoUrl().substring("/uploads/".length()));
            try { java.nio.file.Files.deleteIfExists(old); } catch (Exception ignored) {}
        }
        java.nio.file.Path dir = java.nio.file.Paths.get("uploads","news","attachments");
        java.nio.file.Files.createDirectories(dir);
        
        // Determinar extensión del archivo original
        String ext = "";
        if (lowerFilename.endsWith(".pdf")) ext = ".pdf";
        else if (lowerFilename.endsWith(".docx")) ext = ".docx";
        else if (lowerFilename.endsWith(".doc")) ext = ".doc";
        
        String filename = id+"_"+System.currentTimeMillis()+ext;
        java.nio.file.Path path = dir.resolve(filename);
        file.transferTo(path.toFile());
        n.setAdjuntoUrl("/uploads/news/attachments/"+filename);
        var saved = jpa.save(n);
        audit.log("UPLOAD_ATTACHMENT","News", saved.getId().toString(), filename);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/delete-image")
    public ResponseEntity<?> deleteImage(@PathVariable UUID id) throws java.io.IOException {
        var n = jpa.findById(id).orElseThrow();
        if (n.getImagenUrl() != null && n.getImagenUrl().startsWith("/uploads/")) {
            java.nio.file.Path old = java.nio.file.Paths.get("uploads").resolve(n.getImagenUrl().substring("/uploads/".length()));
            try { java.nio.file.Files.deleteIfExists(old); } catch (Exception ignored) {}
        }
        n.setImagenUrl(null);
        var saved = jpa.save(n);
        audit.log("DELETE_IMAGE","News", saved.getId().toString(), "");
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/delete-attachment")
    public ResponseEntity<?> deleteAttachment(@PathVariable UUID id) throws java.io.IOException {
        var n = jpa.findById(id).orElseThrow();
        if (n.getAdjuntoUrl() != null && n.getAdjuntoUrl().startsWith("/uploads/")) {
            java.nio.file.Path old = java.nio.file.Paths.get("uploads").resolve(n.getAdjuntoUrl().substring("/uploads/".length()));
            try { java.nio.file.Files.deleteIfExists(old); } catch (Exception ignored) {}
        }
        n.setAdjuntoUrl(null);
        var saved = jpa.save(n);
        audit.log("DELETE_ATTACHMENT","News", saved.getId().toString(), "");
        return ResponseEntity.ok(saved);
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
