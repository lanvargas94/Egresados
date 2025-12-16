package com.corhuila.egresados.infrastructure.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {
    private static final Logger log = LoggerFactory.getLogger(StaticResourceConfig.class);
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Usar ruta absoluta fija para Docker (/app/uploads/)
        // En desarrollo local, usar ruta relativa
        String userDir = System.getProperty("user.dir");
        String uploadsPath;
        String dirPath;
        
        if (userDir != null && !userDir.equals("/app")) {
            // Desarrollo local
            uploadsPath = "file:" + userDir + "/uploads/";
            dirPath = userDir + "/uploads/";
        } else {
            // Docker - ruta absoluta
            uploadsPath = "file:/app/uploads/";
            dirPath = "/app/uploads/";
        }
        
        // Crear directorios si no existen
        try {
            java.nio.file.Path newsImagesPath = Paths.get(dirPath, "news", "images");
            java.nio.file.Path newsAttachmentsPath = Paths.get(dirPath, "news", "attachments");
            Files.createDirectories(newsImagesPath);
            Files.createDirectories(newsAttachmentsPath);
            log.info("Directorios de uploads creados/verificados: {} y {}", newsImagesPath, newsAttachmentsPath);
        } catch (Exception e) {
            log.error("Error creando directorios de uploads: {}", e.getMessage());
        }
        
        // Verificar que el directorio existe
        if (Files.exists(Paths.get(dirPath))) {
            log.info("Configurando recursos estáticos en: {}", uploadsPath);
        } else {
            log.warn("El directorio de uploads no existe: {}", dirPath);
        }
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadsPath)
                .setCachePeriod(3600) // Cache por 1 hora
                .resourceChain(true); // Habilitar chain para mejor manejo
    }
}

