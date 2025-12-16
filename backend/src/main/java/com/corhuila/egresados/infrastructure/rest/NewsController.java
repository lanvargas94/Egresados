package com.corhuila.egresados.infrastructure.rest;

import com.corhuila.egresados.domain.model.News;
import com.corhuila.egresados.domain.ports.NewsRepository;
import com.corhuila.egresados.infrastructure.persistence.jpa.repo.SpringNewsJpaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/news")
@io.swagger.v3.oas.annotations.tags.Tag(name = "06. Noticias", description = "Noticias públicas segmentadas por facultad y programa, disponibles para egresados")
public class NewsController {
    private final NewsRepository newsRepository;
    private final SpringNewsJpaRepository jpa;

    public NewsController(NewsRepository newsRepository, SpringNewsJpaRepository jpa) {
        this.newsRepository = newsRepository;
        this.jpa = jpa;
    }

    @GetMapping
    @Operation(
        summary = "Listar noticias públicas",
        description = "Obtiene un listado paginado de noticias publicadas y vigentes, opcionalmente filtradas por facultad y programa"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Listado de noticias obtenido exitosamente"),
        @ApiResponse(responseCode = "500", description = "Error del servidor")
    })
    public ResponseEntity<?> list(
        @Parameter(description = "Número de página (0-indexed)", example = "0")
        @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "Tamaño de página", example = "10")
        @RequestParam(defaultValue = "10") int size,
        @Parameter(description = "Filtrar por facultad (opcional)")
        @RequestParam(required = false) String facultad,
        @Parameter(description = "Filtrar por programa (opcional)")
        @RequestParam(required = false) String programa) {
        return ResponseEntity.ok(newsRepository.findPublicadasVigentes(OffsetDateTime.now(), facultad, programa, page, size));
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Obtener detalle de noticia",
        description = "Obtiene los detalles completos de una noticia publicada y vigente"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Noticia encontrada"),
        @ApiResponse(responseCode = "404", description = "Noticia no encontrada o no disponible"),
        @ApiResponse(responseCode = "500", description = "Error del servidor")
    })
    public ResponseEntity<?> get(
        @Parameter(description = "ID de la noticia", required = true, example = "123e4567-e89b-12d3-a456-426614174000")
        @PathVariable UUID id) {
        var entity = jpa.findById(id);
        if (entity.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        var news = entity.get();
        // Solo permitir acceso a noticias PUBLICADAS y vigentes
        if (news.getEstado() != News.Status.PUBLICADA) {
            return ResponseEntity.notFound().build();
        }
        if (news.getFechaPublicacion() != null && news.getFechaPublicacion().isAfter(OffsetDateTime.now())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(news);
    }
    
    @GetMapping("/{id}/image")
    @Operation(
        summary = "Obtener imagen de noticia",
        description = "Obtiene la imagen asociada a una noticia publicada y vigente. Solo disponible para noticias con estado PUBLICADA y que ya hayan alcanzado su fecha de publicación."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Imagen obtenida exitosamente",
            content = @Content(mediaType = "image/jpeg", schema = @Schema(type = "string", format = "binary"))
        ),
        @ApiResponse(responseCode = "404", description = "Noticia no encontrada, no publicada, sin imagen o archivo no existe"),
        @ApiResponse(responseCode = "500", description = "Error del servidor")
    })
    public ResponseEntity<?> getImage(
        @Parameter(description = "ID de la noticia", required = true, example = "123e4567-e89b-12d3-a456-426614174000")
        @PathVariable UUID id) {
        try {
            var entity = jpa.findById(id);
            if (entity.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            var news = entity.get();
            
            // Solo permitir acceso a noticias PUBLICADAS y vigentes
            if (news.getEstado() != News.Status.PUBLICADA) {
                return ResponseEntity.notFound().build();
            }
            if (news.getFechaPublicacion() != null && news.getFechaPublicacion().isAfter(OffsetDateTime.now())) {
                return ResponseEntity.notFound().build();
            }
            
            if (news.getImagenUrl() == null || news.getImagenUrl().isBlank()) {
                return ResponseEntity.notFound().build();
            }
            
            // Construir ruta del archivo
            String userDir = System.getProperty("user.dir");
            java.nio.file.Path baseDir = java.nio.file.Paths.get(userDir != null && !userDir.equals("/app") ? userDir : "/app");
            String imagePath = news.getImagenUrl();
            if (imagePath.startsWith("/")) {
                imagePath = imagePath.substring(1); // Quitar el / inicial
            }
            java.nio.file.Path filePath = baseDir.resolve(imagePath);
            
            if (!java.nio.file.Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] fileContent = java.nio.file.Files.readAllBytes(filePath);
            String filename = java.nio.file.Paths.get(news.getImagenUrl()).getFileName().toString();
            
            // Determinar content type
            String contentType = "image/jpeg";
            String lowerUrl = news.getImagenUrl().toLowerCase();
            if (lowerUrl.endsWith(".png")) {
                contentType = "image/png";
            } else if (lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg")) {
                contentType = "image/jpeg";
            } else if (lowerUrl.endsWith(".gif")) {
                contentType = "image/gif";
            }
            
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, contentType)
                    .header(org.springframework.http.HttpHeaders.CACHE_CONTROL, "public, max-age=3600")
                    .body(fileContent);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error al obtener imagen: " + ex.getMessage()));
        }
    }
    
    @GetMapping("/{id}/attachment")
    @Operation(
        summary = "Descargar adjunto de noticia",
        description = "Descarga el archivo adjunto asociado a una noticia publicada y vigente. Solo disponible para noticias con estado PUBLICADA y que ya hayan alcanzado su fecha de publicación."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Archivo adjunto descargado exitosamente",
            content = @Content(mediaType = "application/octet-stream", schema = @Schema(type = "string", format = "binary"))
        ),
        @ApiResponse(responseCode = "404", description = "Noticia no encontrada, no publicada, sin adjunto o archivo no existe"),
        @ApiResponse(responseCode = "500", description = "Error del servidor")
    })
    public ResponseEntity<?> downloadAttachment(
        @Parameter(description = "ID de la noticia", required = true, example = "123e4567-e89b-12d3-a456-426614174000")
        @PathVariable UUID id) {
        try {
            var entity = jpa.findById(id);
            if (entity.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            var news = entity.get();
            
            // Solo permitir acceso a noticias PUBLICADAS y vigentes
            if (news.getEstado() != News.Status.PUBLICADA) {
                return ResponseEntity.notFound().build();
            }
            if (news.getFechaPublicacion() != null && news.getFechaPublicacion().isAfter(OffsetDateTime.now())) {
                return ResponseEntity.notFound().build();
            }
            
            if (news.getAdjuntoUrl() == null || news.getAdjuntoUrl().isBlank()) {
                return ResponseEntity.notFound().build();
            }
            
            // Construir ruta del archivo
            String userDir = System.getProperty("user.dir");
            java.nio.file.Path baseDir = java.nio.file.Paths.get(userDir != null && !userDir.equals("/app") ? userDir : "/app");
            String attachmentPath = news.getAdjuntoUrl();
            if (attachmentPath.startsWith("/")) {
                attachmentPath = attachmentPath.substring(1); // Quitar el / inicial
            }
            java.nio.file.Path filePath = baseDir.resolve(attachmentPath);
            
            if (!java.nio.file.Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] fileContent = java.nio.file.Files.readAllBytes(filePath);
            String filename = java.nio.file.Paths.get(news.getAdjuntoUrl()).getFileName().toString();
            
            // Determinar content type
            String contentType = "application/octet-stream";
            String lowerUrl = news.getAdjuntoUrl().toLowerCase();
            if (lowerUrl.endsWith(".pdf")) {
                contentType = "application/pdf";
            } else if (lowerUrl.endsWith(".doc")) {
                contentType = "application/msword";
            } else if (lowerUrl.endsWith(".docx")) {
                contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            }
            
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, contentType)
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(fileContent);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error al descargar adjunto: " + ex.getMessage()));
        }
    }
}
