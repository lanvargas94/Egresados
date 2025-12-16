package com.corhuila.egresados.infrastructure.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${FRONT_ORIGIN:http://localhost:3002}")
    private String frontOrigin;

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        
        return new OpenAPI()
                .info(new Info()
                        .title("API Egresados CORHUILA")
                        .version("1.0.0")
                        .description("""
                                # API REST - Plataforma de Egresados CORHUILA
                                
                                API REST completa para la gestión integral de egresados de la Corporación Universitaria del Huila (CORHUILA).
                                
                                ## 📋 Estructura de la Documentación
                                
                                La documentación está organizada en secciones lógicas:
                                
                                ### 🔐 Autenticación y Autorización
                                - **01. Autenticación de Egresados**: Identificación y autenticación OTP
                                - **02. Autenticación de Administradores**: Login y gestión de sesiones
                                
                                ### 👤 Gestión de Usuario
                                - **03. Onboarding**: Proceso de registro inicial en 3 pasos
                                - **04. Perfil de Egresado**: Gestión completa del perfil personal y profesional
                                
                                ### 📚 Catálogos y Referencias
                                - **05. Catálogos Públicos**: Consulta de países, ciudades, facultades, programas, sectores y tipos de contrato
                                
                                ### 📰 Contenido Público
                                - **06. Noticias**: Noticias segmentadas por facultad y programa
                                - **07. Ofertas de Empleo**: Búsqueda y gestión de interés en ofertas laborales
                                - **08. Eventos**: Visualización y registro (RSVP) a eventos
                                
                                ### 🛠️ Administración
                                - **09. Gestión de Egresados**: CRUD completo de egresados
                                - **10. Gestión de Noticias**: Creación, edición y publicación de noticias
                                - **11. Gestión de Ofertas**: Administración de ofertas de empleo
                                - **12. Gestión de Eventos**: Administración de eventos y asistentes
                                - **13. Analytics**: Estadísticas y métricas del sistema
                                - **14. Reportes**: Generación y exportación de reportes
                                - **15. Gestión de Catálogos**: Administración de catálogos maestros
                                - **16. Gestión de Usuarios Admin**: CRUD de usuarios administradores
                                - **17. Auditoría**: Registro de acciones administrativas
                                
                                ## 🔑 Autenticación
                                
                                La API utiliza **JWT (JSON Web Tokens)** para autenticación. 
                                
                                ### Para Egresados:
                                1. Identifícate con `/api/auth/identify` o solicita OTP con `/api/auth/request-otp`
                                2. Obtén el token JWT de la respuesta
                                3. Incluye el token en el header: `Authorization: Bearer <token>`
                                
                                ### Para Administradores:
                                1. Inicia sesión con `/api/admin/auth/login`
                                2. Obtén el token JWT de la respuesta
                                3. Incluye el token en el header: `Authorization: Bearer <token>`
                                
                                ## 👥 Roles y Permisos
                                
                                | Rol | Descripción | Acceso |
                                |-----|-------------|--------|
                                | **GRAD** | Egresado | Perfil, noticias, ofertas, eventos |
                                | **ADMIN_GENERAL** | Administrador General | Acceso completo a todas las funcionalidades |
                                | **ADMIN_PROGRAMA** | Administrador de Programa | Acceso limitado a programas asignados |
                                
                                ## 📊 Códigos de Estado HTTP
                                
                                | Código | Significado | Descripción |
                                |--------|-------------|-------------|
                                | `200` | OK | Operación exitosa |
                                | `201` | Created | Recurso creado exitosamente |
                                | `400` | Bad Request | Error de validación o solicitud incorrecta |
                                | `401` | Unauthorized | No autenticado o token inválido |
                                | `403` | Forbidden | No autorizado (permisos insuficientes) |
                                | `404` | Not Found | Recurso no encontrado |
                                | `500` | Internal Server Error | Error interno del servidor |
                                
                                ## 🚀 Uso de Swagger UI
                                
                                1. Haz clic en el botón **"Authorize"** (🔒) para autenticarte
                                2. Ingresa tu token JWT: `Bearer <tu-token>` o simplemente `<tu-token>`
                                3. Explora los endpoints organizados por secciones
                                4. Prueba los endpoints directamente desde la interfaz
                                
                                ## 📝 Convenciones
                                
                                - Todos los endpoints retornan JSON
                                - Las fechas están en formato ISO 8601 (UTC)
                                - Los UUIDs se usan como identificadores únicos
                                - La paginación usa `page` (0-indexed) y `size`
                                """))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("🖥️ Servidor de desarrollo local"),
                        new Server()
                                .url(frontOrigin.replace(":3002", ":8080"))
                                .description("🐳 Servidor backend (Docker Compose)")
                ))
                .tags(getTags())
                .addSecurityItem(new SecurityRequirement()
                        .addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Token JWT obtenido mediante autenticación. Formato: 'Bearer <token>' o simplemente '<token>'")));
    }
    
    private List<Tag> getTags() {
        return List.of(
                // Autenticación
                new Tag().name("01. Autenticación de Egresados")
                        .description("Identificación de egresados y autenticación mediante OTP (One-Time Password)"),
                new Tag().name("02. Autenticación de Administradores")
                        .description("Login y gestión de sesiones para usuarios administradores"),
                
                // Gestión de Usuario
                new Tag().name("03. Onboarding")
                        .description("Proceso de registro inicial de egresados en 3 pasos: contacto, información laboral y consentimiento"),
                new Tag().name("04. Perfil de Egresado")
                        .description("Gestión completa del perfil personal y profesional del egresado, incluyendo historial de cambios"),
                
                // Catálogos
                new Tag().name("05. Catálogos Públicos")
                        .description("Consulta de catálogos maestros: países, ciudades, facultades, programas, sectores y tipos de contrato"),
                
                // Contenido Público
                new Tag().name("06. Noticias")
                        .description("Noticias públicas segmentadas por facultad y programa. Incluye endpoints para visualizar imágenes y descargar adjuntos de noticias publicadas"),
                new Tag().name("07. Ofertas de Empleo")
                        .description("Búsqueda de ofertas de empleo y gestión de interés por parte de egresados"),
                new Tag().name("08. Eventos")
                        .description("Visualización de eventos públicos y sistema de registro (RSVP) para egresados"),
                
                // Administración
                new Tag().name("09. Administración - Egresados")
                        .description("Gestión completa de egresados: listado, consulta, actualización, cambio de estados y envío de correo masivo con adjuntos"),
                new Tag().name("10. Administración - Noticias")
                        .description("CRUD completo de noticias: creación, edición, programación y publicación"),
                new Tag().name("11. Administración - Ofertas")
                        .description("Gestión de ofertas de empleo: creación, publicación, archivado y exportación de intereses"),
                new Tag().name("12. Administración - Eventos")
                        .description("Administración de eventos: creación, gestión de asistentes y exportación de registros"),
                new Tag().name("13. Administración - Analytics")
                        .description("Estadísticas y métricas: demografía, empleabilidad y adopción de la plataforma"),
                new Tag().name("14. Administración - Reportes")
                        .description("Generación de reportes predefinidos y exportación de datos de egresados (CSV/Excel)"),
                new Tag().name("15. Administración - Catálogos")
                        .description("Gestión de catálogos maestros: facultades, programas, ciudades, sectores y tipos de contrato"),
                new Tag().name("16. Administración - Usuarios")
                        .description("CRUD de usuarios administradores y gestión de roles"),
                new Tag().name("17. Administración - Auditoría")
                        .description("Registro y consulta de acciones administrativas para trazabilidad")
        );
    }
}

