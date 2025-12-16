# Guía de Documentación Swagger/OpenAPI

Este documento explica cómo agregar y mejorar la documentación Swagger para los endpoints de la API.

## Configuración Actual

La configuración de Swagger está en:
- **Configuración principal**: `backend/src/main/java/com/corhuila/egresados/infrastructure/config/OpenApiConfig.java`
- **Configuración YAML**: `backend/src/main/resources/application.yml` (sección `springdoc`)
- **Seguridad**: Los endpoints de Swagger están permitidos en `SecurityConfig.java`

## Acceso a Swagger

- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`
- **OpenAPI YAML**: `http://localhost:8080/v3/api-docs.yaml`

## Anotaciones Principales

### 1. Anotación de Clase (Tag)

Agrupa endpoints relacionados:

```java
@Tag(name = "Nombre del Grupo", description = "Descripción del grupo de endpoints")
@RestController
@RequestMapping("/api/ruta")
public class MiController {
    // ...
}
```

### 2. Anotación de Método (Operation)

Documenta un endpoint individual:

```java
@Operation(
    summary = "Resumen breve del endpoint",
    description = "Descripción detallada de lo que hace el endpoint"
)
@GetMapping("/endpoint")
public ResponseEntity<?> miEndpoint() {
    // ...
}
```

### 3. Seguridad (SecurityRequirement)

Indica que el endpoint requiere autenticación:

```java
@Operation(summary = "Endpoint protegido")
@SecurityRequirement(name = "bearerAuth")
@GetMapping("/protegido")
public ResponseEntity<?> endpointProtegido() {
    // ...
}
```

### 4. Respuestas (ApiResponses)

Documenta las posibles respuestas:

```java
@Operation(summary = "Mi endpoint")
@ApiResponses(value = {
    @ApiResponse(
        responseCode = "200",
        description = "Operación exitosa",
        content = @Content(
            mediaType = "application/json",
            examples = @ExampleObject(value = """
                {
                    "id": "123",
                    "nombre": "Ejemplo"
                }
                """)
        )
    ),
    @ApiResponse(responseCode = "400", description = "Error de validación"),
    @ApiResponse(responseCode = "401", description = "No autenticado"),
    @ApiResponse(responseCode = "404", description = "No encontrado")
})
@GetMapping("/ejemplo")
public ResponseEntity<?> ejemplo() {
    // ...
}
```

### 5. Parámetros (Parameter)

Documenta parámetros de query, path o header:

```java
@Operation(summary = "Buscar egresados")
@GetMapping("/search")
public ResponseEntity<?> buscar(
    @Parameter(description = "Nombre a buscar", example = "Juan Pérez")
    @RequestParam String nombre,
    
    @Parameter(description = "Número de página", example = "0")
    @RequestParam(defaultValue = "0") int page
) {
    // ...
}
```

### 6. Request Body

Documenta el cuerpo de la petición:

```java
@Operation(summary = "Crear recurso")
@PostMapping
public ResponseEntity<?> crear(
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        description = "Datos del nuevo recurso",
        required = true,
        content = @Content(
            examples = @ExampleObject(value = """
                {
                    "nombre": "Ejemplo",
                    "email": "ejemplo@correo.com"
                }
                """)
        )
    )
    @Valid @RequestBody MiRequest request
) {
    // ...
}
```

## Ejemplo Completo

```java
package com.corhuila.egresados.infrastructure.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ejemplo")
@Tag(name = "Ejemplo", description = "Endpoints de ejemplo para documentación")
public class EjemploController {

    @Operation(
        summary = "Obtener recurso por ID",
        description = "Retorna un recurso específico identificado por su ID único"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Recurso encontrado",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "nombre": "Ejemplo",
                        "activo": true
                    }
                    """)
            )
        ),
        @ApiResponse(responseCode = "404", description = "Recurso no encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(
        @Parameter(description = "ID único del recurso", example = "123e4567-e89b-12d3-a456-426614174000")
        @PathVariable String id
    ) {
        // Implementación
        return ResponseEntity.ok().build();
    }

    @Operation(
        summary = "Crear nuevo recurso",
        description = "Crea un nuevo recurso en el sistema. Requiere autenticación."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "Recurso creado exitosamente"
        ),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    @PostMapping
    public ResponseEntity<?> crear(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Datos del nuevo recurso",
            required = true,
            content = @Content(
                examples = @ExampleObject(value = """
                    {
                        "nombre": "Nuevo Recurso",
                        "descripcion": "Descripción del recurso"
                    }
                    """)
            )
        )
        @Valid @RequestBody MiRequest request
    ) {
        // Implementación
        return ResponseEntity.status(201).build();
    }
}
```

## Mejores Prácticas

1. **Siempre agrega `@Tag`** a los controladores para agrupar endpoints relacionados
2. **Usa `@Operation`** en todos los métodos públicos
3. **Documenta respuestas** con `@ApiResponses` para códigos de estado importantes
4. **Agrega ejemplos** cuando sea útil para entender el formato esperado
5. **Marca endpoints protegidos** con `@SecurityRequirement(name = "bearerAuth")`
6. **Documenta parámetros** complejos con `@Parameter`
7. **Usa descripciones claras** y en español para facilitar el entendimiento

## Dependencias

Las anotaciones de Swagger están incluidas en:
```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.5.0</version>
</dependency>
```

## Verificar Documentación

1. Inicia la aplicación
2. Accede a `http://localhost:8080/swagger-ui.html`
3. Verifica que tus endpoints aparezcan correctamente documentados
4. Prueba los endpoints directamente desde Swagger UI

## Autenticación en Swagger UI

Para probar endpoints protegidos:

1. Obtén un token JWT (mediante `/api/auth/identify` o `/api/admin/auth/login`)
2. En Swagger UI, haz clic en el botón **"Authorize"** (🔒)
3. Ingresa el token: `Bearer <tu-token>` o simplemente `<tu-token>`
4. Haz clic en "Authorize" y luego "Close"
5. Ahora puedes probar endpoints protegidos

## Exportar Documentación

Puedes exportar la especificación OpenAPI:

- **JSON**: `http://localhost:8080/v3/api-docs`
- **YAML**: `http://localhost:8080/v3/api-docs.yaml`

Estos archivos se pueden usar con herramientas como:
- Postman (importar OpenAPI)
- Insomnia (importar OpenAPI)
- Generadores de código cliente
- Herramientas de testing



