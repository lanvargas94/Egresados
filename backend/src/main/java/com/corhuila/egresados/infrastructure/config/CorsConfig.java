package com.corhuila.egresados.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter(@Value("${FRONT_ORIGIN:http://localhost:8080}") String frontOrigin) {
        CorsConfiguration config = new CorsConfiguration();
        // Permitir múltiples orígenes para desarrollo
        config.setAllowedOrigins(List.of(
            frontOrigin,
            "http://localhost:8080",
            "http://localhost:4200",
            "http://127.0.0.1:8080",
            "http://127.0.0.1:4200"
        ));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS","PATCH"));
        config.setAllowedHeaders(List.of("Authorization","Content-Type","Accept","Origin","X-Requested-With"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        source.registerCorsConfiguration("/uploads/**", config);
        return new CorsFilter(source);
    }
}

