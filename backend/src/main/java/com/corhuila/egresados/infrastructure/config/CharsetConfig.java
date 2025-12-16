package com.corhuila.egresados.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Configuración para asegurar que toda la aplicación use UTF-8
 * para manejar correctamente caracteres especiales (tildes, ñ, etc.)
 * 
 * Nota: El filtro CharacterEncodingFilter se configura automáticamente
 * mediante spring.http.encoding en application.yml
 */
@Configuration
public class CharsetConfig implements WebMvcConfigurer {
    
    /**
     * Configurar los convertidores de mensajes HTTP para usar UTF-8
     */
    @Override
    public void configureMessageConverters(@NonNull List<HttpMessageConverter<?>> converters) {
        // Asegurar que StringHttpMessageConverter use UTF-8
        @SuppressWarnings("null")
        java.nio.charset.Charset utf8 = StandardCharsets.UTF_8;
        StringHttpMessageConverter stringConverter = new StringHttpMessageConverter(utf8);
        converters.add(0, stringConverter); // Agregar al inicio para que tenga prioridad
    }
}

