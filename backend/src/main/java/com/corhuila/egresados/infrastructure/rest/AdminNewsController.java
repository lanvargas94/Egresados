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
        var pg = jpa.adminList(estado, org.springframework.data.domain.PageRequest.of(page, size));
        return ResponseEntity.ok(java.util.Map.of("items", pg.getContent(), "total", pg.getTotalElements(), "page", page, "size", size));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody NewsEntity n) {
        if (n.getId() == null) n.setId(UUID.randomUUID());
        if (n.getEstado() == null) n.setEstado(News.Status.BORRADOR);
        var saved = jpa.save(n);
        audit.log("CREATE","News", saved.getId().toString(), saved.getTitulo());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody NewsEntity n) {
        n.setId(id);
        var saved = jpa.save(n);
        audit.log("UPDATE","News", saved.getId().toString(), saved.getTitulo());
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable UUID id) { return ResponseEntity.ok(jpa.findById(id).orElseThrow()); }

    @PostMapping("/{id}/schedule")
    public ResponseEntity<?> schedule(@PathVariable UUID id, @RequestParam String fecha) {
        var n = jpa.findById(id).orElseThrow();
        n.setFechaPublicacion(OffsetDateTime.parse(fecha));
        n.setEstado(News.Status.PROGRAMADA);
        var saved = jpa.save(n);
        audit.log("SCHEDULE","News", saved.getId().toString(), saved.getTitulo());
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<?> publish(@PathVariable UUID id) {
        var n = jpa.findById(id).orElseThrow();
        if (n.getTitulo() == null || n.getTitulo().isBlank() || n.getCuerpoHtml() == null || n.getCuerpoHtml().isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error","RN-AN01: título y cuerpo requeridos"));
        }
        n.setEstado(News.Status.PUBLICADA);
        if (n.getFechaPublicacion() == null) n.setFechaPublicacion(OffsetDateTime.now());
        var saved = jpa.save(n);
        audit.log("PUBLISH","News", saved.getId().toString(), saved.getTitulo());
        return ResponseEntity.ok(saved);
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
        if (file.getSize() > 10 * 1024 * 1024) return ResponseEntity.badRequest().body(java.util.Map.of("error","Archivo > 10MB"));
        String ct = file.getContentType();
        if (ct == null || !(ct.equals("application/pdf") || ct.equals("image/jpeg") || ct.equals("image/png"))) return ResponseEntity.badRequest().body(java.util.Map.of("error","Solo PDF/JPG/PNG"));
        var n = jpa.findById(id).orElseThrow();
        // Reemplazo: borrar archivo anterior si existe
        if (n.getAdjuntoUrl() != null && n.getAdjuntoUrl().startsWith("/uploads/")) {
            java.nio.file.Path old = java.nio.file.Paths.get("uploads").resolve(n.getAdjuntoUrl().substring("/uploads/".length()));
            try { java.nio.file.Files.deleteIfExists(old); } catch (Exception ignored) {}
        }
        java.nio.file.Path dir = java.nio.file.Paths.get("uploads","news","attachments");
        java.nio.file.Files.createDirectories(dir);
        String ext = ct.equals("application/pdf")?".pdf": (ct.equals("image/png")?".png":".jpg");
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
}
