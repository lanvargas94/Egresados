# Especificación Técnica de Integración con CORHUILA Plus
## Plataforma de Egresados CORHUILA

**Versión:** 1.0  
**Fecha:** Noviembre 2025  
**Autor:** Equipo de Desarrollo - Plataforma de Egresados CORHUILA

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Objetivo de la Integración](#objetivo-de-la-integración)
3. [Arquitectura de Integración](#arquitectura-de-integración)
4. [Contrato de Datos](#contrato-de-datos)
5. [Métodos de Integración](#métodos-de-integración)
6. [Autenticación y Seguridad](#autenticación-y-seguridad)
7. [Formato de Datos](#formato-de-datos)
8. [Validaciones y Reglas de Negocio](#validaciones-y-reglas-de-negocio)
9. [Ejemplos de Integración](#ejemplos-de-integración)
10. [Manejo de Errores](#manejo-de-errores)
11. [Consideraciones Técnicas](#consideraciones-técnicas)
12. [Plan de Implementación](#plan-de-implementación)

---

## 1. Resumen Ejecutivo

Este documento define la especificación técnica para la integración entre **CORHUILA Plus** (sistema académico principal) y la **Plataforma de Egresados CORHUILA** (sistema de gestión de egresados).

### Objetivo Principal
Sincronizar los datos de egresados desde CORHUILA Plus hacia la Plataforma de Egresados para mantener actualizada la información base de los graduados, permitiendo que los egresados completen su perfil y accedan a servicios adicionales.

### Alcance
- Sincronización de datos básicos de egresados (identificación, nombre, programas)
- Identificación única mediante `id_interno` de CORHUILA Plus
- Sincronización de programas académicos (facultad, programa, año de graduación)
- Actualización incremental de datos existentes

---

## 2. Objetivo de la Integración

La integración tiene como propósito:

1. **Sincronización inicial**: Cargar la base de datos de egresados desde CORHUILA Plus
2. **Actualización continua**: Mantener sincronizados los datos cuando haya cambios en CORHUILA Plus
3. **Identificación única**: Usar `id_interno` de CORHUILA Plus como identificador de referencia
4. **Preservación de datos**: No sobrescribir información que el egresado haya completado en la plataforma

---

## 3. Arquitectura de Integración

### 3.1 Opciones de Integración

#### Opción A: API REST (Recomendada)
- **Ventajas**: 
  - Desacoplamiento entre sistemas
  - Control de acceso y seguridad
  - Versionado de API
  - Fácil de auditar y monitorear
- **Implementación**: CORHUILA Plus expone endpoints REST que la Plataforma de Egresados consume

#### Opción B: Base de Datos Compartida
- **Ventajas**: 
  - Acceso directo a datos
  - Sincronización en tiempo real
- **Desventajas**: 
  - Acoplamiento fuerte
  - Riesgos de seguridad
  - Dificultad para auditar cambios
- **Implementación**: Acceso de lectura a tablas específicas de CORHUILA Plus

#### Opción C: Webhook/Eventos
- **Ventajas**: 
  - Notificaciones en tiempo real
  - Bajo acoplamiento
- **Implementación**: CORHUILA Plus envía eventos cuando hay cambios en datos de egresados

#### Opción D: Archivo Batch (CSV/Excel)
- **Ventajas**: 
  - Implementación simple
  - Útil para cargas iniciales
- **Desventajas**: 
  - No es tiempo real
  - Requiere procesamiento manual
- **Implementación**: Exportación periódica desde CORHUILA Plus e importación en la Plataforma

### 3.2 Recomendación

**Opción A (API REST)** es la recomendada por:
- Seguridad y control de acceso
- Escalabilidad
- Mantenibilidad
- Facilidad de monitoreo y auditoría

---

## 4. Contrato de Datos

### 4.1 Estructura de Datos de Egresado

#### 4.1.1 Campos Obligatorios

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `id_interno` | String(100) | **ID único de CORHUILA Plus** (clave de sincronización) | `"CORH-2024-001234"` |
| `identificacion` | String(100) | Número de documento de identidad (CC, TI, CE, etc.) | `"1234567890"` |
| `nombre_legal` | String(200) | Nombre completo legal del egresado | `"Juan Pérez García"` |

#### 4.1.2 Campos Opcionales

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `correo_personal` | String(200) | Correo electrónico personal | `"juan.perez@email.com"` |
| `correo_institucional` | String(200) | Correo institucional (@corhuila.edu.co) | `"juan.perez@corhuila.edu.co"` |
| `telefono_movil` | String(30) | Teléfono móvil (formato E.164 recomendado) | `"+573001234567"` |
| `pais` | String(100) | País de residencia (código ISO 3166-1 alpha-2) | `"CO"` |
| `ciudad` | String(100) | Ciudad de residencia | `"Neiva"` |

#### 4.1.3 Programas Académicos (Array)

Cada egresado puede tener uno o más programas académicos:

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `facultad` | String(150) | Nombre de la facultad | `"Ingeniería"` |
| `programa` | String(150) | Nombre del programa académico | `"Ingeniería de Sistemas"` |
| `anio` | Integer | Año de graduación | `2020` |
| `titulo_obtenido` | String(200) | Título obtenido (opcional) | `"Ingeniero de Sistemas"` |
| `modalidad` | String(50) | Modalidad de estudio (opcional) | `"Presencial"`, `"Virtual"` |

### 4.2 Estructura JSON Completa

```json
{
  "id_interno": "CORH-2024-001234",
  "identificacion": "1234567890",
  "nombre_legal": "Juan Pérez García",
  "correo_personal": "juan.perez@email.com",
  "correo_institucional": "juan.perez@corhuila.edu.co",
  "telefono_movil": "+573001234567",
  "pais": "CO",
  "ciudad": "Neiva",
  "programas": [
    {
      "facultad": "Ingeniería",
      "programa": "Ingeniería de Sistemas",
      "anio": 2020,
      "titulo_obtenido": "Ingeniero de Sistemas",
      "modalidad": "Presencial"
    },
    {
      "facultad": "Ingeniería",
      "programa": "Especialización en Desarrollo de Software",
      "anio": 2022,
      "titulo_obtenido": "Especialista en Desarrollo de Software",
      "modalidad": "Virtual"
    }
  ],
  "fecha_actualizacion": "2025-11-23T10:30:00-05:00"
}
```

### 4.3 Mapeo de Campos

| Campo CORHUILA Plus | Campo Plataforma Egresados | Notas |
|---------------------|---------------------------|-------|
| `id_interno` | `id_interno` | **Clave de sincronización** |
| `numero_documento` | `identificacion` | Debe ser único |
| `nombre_completo` | `nombre_legal` | |
| `email_personal` | `correo_personal` | |
| `email_institucional` | - | Se puede usar como respaldo |
| `telefono` | `telefono_movil_e164` | Formato E.164 recomendado |
| `pais_residencia` | `pais` | Código ISO 3166-1 alpha-2 |
| `ciudad_residencia` | `ciudad` | |
| `facultad` | `programas[].facultad` | Array de programas |
| `programa` | `programas[].programa` | Array de programas |
| `anio_graduacion` | `programas[].anio` | Array de programas |

---

## 5. Métodos de Integración

### 5.1 API REST (Recomendado)

#### 5.1.1 Endpoints Requeridos

##### GET /api/corhuilaplus/graduates
**Descripción**: Obtener listado de egresados

**Parámetros de Query:**
- `page` (opcional): Número de página (default: 0)
- `size` (opcional): Tamaño de página (default: 100, max: 1000)
- `updated_since` (opcional): Fecha ISO 8601 - Solo egresados actualizados desde esta fecha
- `id_interno` (opcional): Filtrar por ID interno específico

**Respuesta:**
```json
{
  "items": [
    {
      "id_interno": "CORH-2024-001234",
      "identificacion": "1234567890",
      "nombre_legal": "Juan Pérez García",
      "correo_personal": "juan.perez@email.com",
      "telefono_movil": "+573001234567",
      "pais": "CO",
      "ciudad": "Neiva",
      "programas": [
        {
          "facultad": "Ingeniería",
          "programa": "Ingeniería de Sistemas",
          "anio": 2020
        }
      ],
      "fecha_actualizacion": "2025-11-23T10:30:00-05:00"
    }
  ],
  "total": 1500,
  "page": 0,
  "size": 100,
  "hasMore": true
}
```

##### GET /api/corhuilaplus/graduates/{id_interno}
**Descripción**: Obtener un egresado específico por ID interno

**Respuesta:**
```json
{
  "id_interno": "CORH-2024-001234",
  "identificacion": "1234567890",
  "nombre_legal": "Juan Pérez García",
  "correo_personal": "juan.perez@email.com",
  "telefono_movil": "+573001234567",
  "pais": "CO",
  "ciudad": "Neiva",
  "programas": [
    {
      "facultad": "Ingeniería",
      "programa": "Ingeniería de Sistemas",
      "anio": 2020,
      "titulo_obtenido": "Ingeniero de Sistemas",
      "modalidad": "Presencial"
    }
  ],
  "fecha_actualizacion": "2025-11-23T10:30:00-05:00"
}
```

##### POST /api/corhuilaplus/graduates/batch
**Descripción**: Envío masivo de egresados (útil para sincronización inicial)

**Body:**
```json
{
  "graduates": [
    {
      "id_interno": "CORH-2024-001234",
      "identificacion": "1234567890",
      "nombre_legal": "Juan Pérez García",
      "programas": [...]
    },
    {
      "id_interno": "CORH-2024-001235",
      "identificacion": "0987654321",
      "nombre_legal": "María González López",
      "programas": [...]
    }
  ]
}
```

**Respuesta:**
```json
{
  "processed": 100,
  "created": 95,
  "updated": 5,
  "errors": []
}
```

#### 5.1.2 Headers Requeridos

```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

### 5.2 Base de Datos Directa

Si se opta por acceso directo a base de datos, se requiere:

#### 5.2.1 Permisos Necesarios
- **Solo lectura** en tablas de egresados
- Acceso a vistas materializadas (recomendado) o tablas específicas

#### 5.2.2 Vistas/Tablas Requeridas

**Vista: `v_egresados_plataforma`** (recomendado)

```sql
CREATE VIEW v_egresados_plataforma AS
SELECT 
    id_interno,
    numero_documento AS identificacion,
    nombre_completo AS nombre_legal,
    email_personal AS correo_personal,
    telefono AS telefono_movil,
    pais_residencia AS pais,
    ciudad_residencia AS ciudad,
    fecha_actualizacion
FROM egresados
WHERE activo = true;
```

**Tabla: `egresados_programas`**

```sql
SELECT 
    id_interno,
    facultad,
    programa,
    anio_graduacion AS anio,
    titulo_obtenido,
    modalidad
FROM egresados_programas
WHERE id_interno = ?
ORDER BY anio_graduacion DESC;
```

#### 5.2.3 Consultas Recomendadas

**Obtener todos los egresados:**
```sql
SELECT * FROM v_egresados_plataforma
ORDER BY id_interno
LIMIT ? OFFSET ?;
```

**Obtener egresados actualizados desde fecha:**
```sql
SELECT * FROM v_egresados_plataforma
WHERE fecha_actualizacion >= ?
ORDER BY fecha_actualizacion;
```

**Obtener programas de un egresado:**
```sql
SELECT * FROM egresados_programas
WHERE id_interno = ?
ORDER BY anio_graduacion DESC;
```

### 5.3 Webhook/Eventos

Si se implementa webhook, CORHUILA Plus debe enviar eventos cuando:

- Se crea un nuevo egresado
- Se actualiza información de un egresado
- Se agrega un nuevo programa a un egresado

**Endpoint en Plataforma de Egresados:**
```
POST /api/integration/corhuilaplus/webhook
```

**Payload de Evento:**
```json
{
  "event_type": "graduate.updated",
  "timestamp": "2025-11-23T10:30:00-05:00",
  "data": {
    "id_interno": "CORH-2024-001234",
    "identificacion": "1234567890",
    "nombre_legal": "Juan Pérez García",
    "programas": [...]
  }
}
```

**Tipos de Eventos:**
- `graduate.created`: Nuevo egresado creado
- `graduate.updated`: Egresado actualizado
- `graduate.deleted`: Egresado eliminado (soft delete)
- `program.added`: Nuevo programa agregado a egresado

---

## 6. Autenticación y Seguridad

### 6.1 API REST

#### 6.1.1 Autenticación por Token JWT

**Flujo:**
1. CORHUILA Plus genera un token JWT con credenciales precompartidas
2. Token se envía en header `Authorization: Bearer {token}`
3. Plataforma de Egresados valida el token

**Configuración del Token:**
- Algoritmo: HS256 o RS256
- Expiración: 1 hora (recomendado)
- Claims requeridos:
  - `iss`: "corhuilaplus"
  - `aud`: "egresados-platform"
  - `sub`: ID del sistema
  - `exp`: Fecha de expiración

#### 6.1.2 Autenticación por API Key

**Alternativa más simple:**
```
Authorization: ApiKey {api_key}
```

**Header:**
```
X-API-Key: {api_key}
```

### 6.2 Base de Datos

- Usuario de base de datos con permisos **solo lectura**
- Conexión mediante SSL/TLS
- IP whitelist (solo desde servidores autorizados)
- Credenciales almacenadas de forma segura (variables de entorno, secretos)

### 6.3 Webhook

- Firma HMAC del payload para verificar autenticidad
- Header: `X-Signature: sha256={hmac_signature}`
- Validación en el endpoint receptor

---

## 7. Formato de Datos

### 7.1 Codificación de Caracteres
- **UTF-8** obligatorio para todos los campos de texto
- Soporte completo para tildes, ñ y caracteres especiales

### 7.2 Formato de Fechas
- **ISO 8601** con timezone: `YYYY-MM-DDTHH:mm:ss±HH:mm`
- Ejemplo: `2025-11-23T10:30:00-05:00`

### 7.3 Formato de Teléfono
- **E.164** recomendado: `+573001234567`
- Alternativa: Formato nacional sin espacios ni guiones

### 7.4 Códigos de País
- **ISO 3166-1 alpha-2**: `CO`, `US`, `MX`, etc.

### 7.5 Valores Booleanos
- JSON: `true` / `false`
- Base de datos: `true` / `false` o `1` / `0`

---

## 8. Validaciones y Reglas de Negocio

### 8.1 Validaciones Obligatorias

| Campo | Validación |
|-------|------------|
| `id_interno` | No nulo, no vacío, único |
| `identificacion` | No nulo, no vacío, único, solo números |
| `nombre_legal` | No nulo, no vacío, mínimo 3 caracteres |
| `programas` | Array no vacío, al menos un programa |

### 8.2 Validaciones Opcionales

| Campo | Validación |
|-------|------------|
| `correo_personal` | Formato de email válido si está presente |
| `telefono_movil` | Formato E.164 si está presente |
| `pais` | Código ISO 3166-1 alpha-2 válido si está presente |
| `programas[].anio` | Año entre 1950 y año actual + 1 |

### 8.3 Reglas de Negocio

1. **Preservación de Datos del Usuario**:
   - Si un egresado ya completó su perfil en la plataforma, **NO** se sobrescriben:
     - `correo_personal` (si ya está verificado)
     - `telefono_movil`
     - `pais` y `ciudad`
     - Información laboral
     - Preferencias de comunicación

2. **Sincronización de Programas**:
   - Los programas se **agregan** si no existen
   - Si un programa ya existe (mismo facultad, programa, año), se actualiza
   - No se eliminan programas que el usuario haya agregado manualmente

3. **Identificación Única**:
   - `id_interno` es la clave de sincronización
   - `identificacion` debe ser único en el sistema
   - Si hay conflicto, se usa `id_interno` para resolver

4. **Actualización Incremental**:
   - Solo se actualizan campos que tienen valor en CORHUILA Plus
   - Campos `null` o vacíos no sobrescriben datos existentes

---

## 9. Ejemplos de Integración

### 9.1 Sincronización Inicial (API REST)

**Request:**
```bash
curl -X GET "https://corhuilaplus.corhuila.edu.co/api/graduates?page=0&size=100" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "items": [
    {
      "id_interno": "CORH-2024-001234",
      "identificacion": "1234567890",
      "nombre_legal": "Juan Pérez García",
      "programas": [
        {
          "facultad": "Ingeniería",
          "programa": "Ingeniería de Sistemas",
          "anio": 2020
        }
      ]
    }
  ],
  "total": 1500,
  "page": 0,
  "size": 100,
  "hasMore": true
}
```

### 9.2 Sincronización Incremental (API REST)

**Request:**
```bash
curl -X GET "https://corhuilaplus.corhuila.edu.co/api/graduates?updated_since=2025-11-22T00:00:00-05:00" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

### 9.3 Obtener Egresado Específico

**Request:**
```bash
curl -X GET "https://corhuilaplus.corhuila.edu.co/api/graduates/CORH-2024-001234" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

### 9.4 Webhook - Egresado Actualizado

**Request (desde CORHUILA Plus):**
```bash
curl -X POST "https://egresados.corhuila.edu.co/api/integration/corhuilaplus/webhook" \
  -H "Content-Type: application/json" \
  -H "X-Signature: sha256={hmac_signature}" \
  -d '{
    "event_type": "graduate.updated",
    "timestamp": "2025-11-23T10:30:00-05:00",
    "data": {
      "id_interno": "CORH-2024-001234",
      "identificacion": "1234567890",
      "nombre_legal": "Juan Pérez García",
      "programas": [
        {
          "facultad": "Ingeniería",
          "programa": "Ingeniería de Sistemas",
          "anio": 2020
        }
      ]
    }
  }'
```

### 9.5 Consulta Directa a Base de Datos

```sql
-- Obtener egresado por ID interno
SELECT 
    e.id_interno,
    e.numero_documento AS identificacion,
    e.nombre_completo AS nombre_legal,
    e.email_personal AS correo_personal,
    e.telefono AS telefono_movil,
    e.pais_residencia AS pais,
    e.ciudad_residencia AS ciudad
FROM v_egresados_plataforma e
WHERE e.id_interno = 'CORH-2024-001234';

-- Obtener programas del egresado
SELECT 
    ep.facultad,
    ep.programa,
    ep.anio_graduacion AS anio,
    ep.titulo_obtenido,
    ep.modalidad
FROM egresados_programas ep
WHERE ep.id_interno = 'CORH-2024-001234'
ORDER BY ep.anio_graduacion DESC;
```

---

## 10. Manejo de Errores

### 10.1 Códigos de Estado HTTP (API REST)

| Código | Significado | Descripción |
|--------|-------------|-------------|
| `200` | OK | Operación exitosa |
| `201` | Created | Recurso creado exitosamente |
| `400` | Bad Request | Datos inválidos o faltantes |
| `401` | Unauthorized | Token inválido o expirado |
| `403` | Forbidden | Sin permisos para acceder |
| `404` | Not Found | Recurso no encontrado |
| `409` | Conflict | Conflicto (ej: identificacion duplicada) |
| `429` | Too Many Requests | Límite de rate limiting excedido |
| `500` | Internal Server Error | Error interno del servidor |
| `503` | Service Unavailable | Servicio temporalmente no disponible |

### 10.2 Formato de Respuesta de Error

```json
{
  "error": "Bad Request",
  "message": "El campo 'identificacion' es requerido",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "identificacion",
      "message": "No puede estar vacío"
    }
  ],
  "timestamp": "2025-11-23T10:30:00-05:00"
}
```

### 10.3 Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `identificacion duplicada` | Ya existe un egresado con esa identificación | Usar `id_interno` para identificar el registro correcto |
| `id_interno no encontrado` | El ID interno no existe en CORHUILA Plus | Verificar que el ID sea correcto |
| `programa inválido` | La facultad o programa no existe en catálogo | Verificar nombres exactos de facultad y programa |
| `token expirado` | El token JWT expiró | Renovar el token |
| `rate limit excedido` | Demasiadas solicitudes | Implementar backoff exponencial |

---

## 11. Consideraciones Técnicas

### 11.1 Performance

- **Paginación**: Máximo 1000 registros por página
- **Rate Limiting**: Máximo 1000 requests por hora por IP/API Key
- **Timeout**: 30 segundos para requests síncronos
- **Batch Processing**: Para sincronizaciones masivas, usar endpoints batch

### 11.2 Disponibilidad

- **Horario de Mantenimiento**: Notificar con 48 horas de anticipación
- **SLA**: 99.5% de disponibilidad (uptime)
- **Backup**: Datos respaldados diariamente

### 11.3 Versionado

- **Versionado de API**: `/api/v1/graduates`
- **Compatibilidad**: Mantener versiones anteriores por mínimo 6 meses
- **Deprecación**: Notificar con 3 meses de anticipación

### 11.4 Logging y Auditoría

- Todos los accesos se registran con:
  - Timestamp
  - IP origen
  - Usuario/sistema que accede
  - Operación realizada
  - Resultado (éxito/error)

### 11.5 Monitoreo

- Métricas disponibles:
  - Número de requests por minuto
  - Tiempo de respuesta promedio
  - Tasa de errores
  - Uso de recursos

---

## 12. Plan de Implementación

### 12.1 Fase 1: Preparación (Semana 1-2)

1. **Definir método de integración** (API REST recomendado)
2. **Configurar autenticación** (JWT o API Key)
3. **Crear endpoints/vistas** en CORHUILA Plus
4. **Configurar acceso** (IP whitelist, credenciales)

### 12.2 Fase 2: Desarrollo (Semana 3-4)

1. **Implementar cliente de integración** en Plataforma de Egresados
2. **Desarrollar sincronización inicial** (carga masiva)
3. **Desarrollar sincronización incremental** (actualizaciones)
4. **Implementar manejo de errores** y reintentos

### 12.3 Fase 3: Pruebas (Semana 5)

1. **Pruebas unitarias** de integración
2. **Pruebas de sincronización** con datos de prueba
3. **Pruebas de carga** (volumen de datos)
4. **Pruebas de errores** y casos límite

### 12.4 Fase 4: Despliegue (Semana 6)

1. **Sincronización inicial** en ambiente de producción
2. **Monitoreo** de la integración
3. **Ajustes** según resultados
4. **Documentación** de operación

### 12.5 Fase 5: Mantenimiento (Continuo)

1. **Monitoreo diario** de sincronizaciones
2. **Resolución de errores** reportados
3. **Optimizaciones** según necesidad
4. **Actualizaciones** de documentación

---

## 13. Contacto y Soporte

### Equipo de Desarrollo - Plataforma de Egresados CORHUILA

- **Email**: desarrollo@corhuila.edu.co
- **Documentación API**: `http://localhost:8080/swagger-ui.html` (desarrollo)
- **Repositorio**: [GitHub - Egresados CORHUILA]

### Preguntas Frecuentes

**P: ¿Con qué frecuencia se debe sincronizar?**
R: Depende del volumen de cambios. Recomendado: diario o en tiempo real (webhook).

**P: ¿Qué pasa si un egresado ya tiene datos en la plataforma?**
R: Los datos del usuario tienen prioridad. Solo se actualizan campos que el usuario no ha completado.

**P: ¿Se pueden sincronizar datos históricos?**
R: Sí, mediante el parámetro `updated_since` o consulta directa sin filtro de fecha.

**P: ¿Qué hacer si hay un error en la sincronización?**
R: Revisar logs, verificar formato de datos, y reintentar. Si persiste, contactar al equipo de desarrollo.

---

## 14. Anexos

### Anexo A: Esquema de Base de Datos

```sql
-- Tabla de egresados en Plataforma de Egresados
CREATE TABLE graduates (
    id UUID PRIMARY KEY,
    id_interno VARCHAR(100) UNIQUE,  -- Clave de sincronización
    identificacion VARCHAR(100) NOT NULL UNIQUE,
    nombre_legal VARCHAR(200),
    correo_personal VARCHAR(200),
    pais VARCHAR(100),
    ciudad VARCHAR(100),
    telefono_movil_e164 VARCHAR(30),
    -- ... otros campos
    creado_en TIMESTAMPTZ,
    actualizado_en TIMESTAMPTZ
);

-- Tabla de programas
CREATE TABLE programs (
    id SERIAL PRIMARY KEY,
    graduate_id UUID REFERENCES graduates(id) ON DELETE CASCADE,
    facultad VARCHAR(150),
    programa VARCHAR(150),
    anio INTEGER
);
```

### Anexo B: Ejemplo de Código de Integración (Java/Spring Boot)

```java
@Service
public class CorhuilaPlusIntegrationService {
    
    @Value("${corhuilaplus.api.url}")
    private String apiUrl;
    
    @Value("${corhuilaplus.api.token}")
    private String apiToken;
    
    public List<GraduateDTO> syncGraduates(String updatedSince) {
        String url = apiUrl + "/api/graduates?updated_since=" + updatedSince;
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiToken);
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<?> entity = new HttpEntity<>(headers);
        ResponseEntity<GraduateListResponse> response = restTemplate.exchange(
            url, HttpMethod.GET, entity, GraduateListResponse.class
        );
        
        return response.getBody().getItems();
    }
}
```

### Anexo C: Checklist de Implementación

- [ ] Método de integración definido (API REST / BD / Webhook)
- [ ] Autenticación configurada
- [ ] Endpoints/vistas creados en CORHUILA Plus
- [ ] Cliente de integración desarrollado
- [ ] Sincronización inicial implementada
- [ ] Sincronización incremental implementada
- [ ] Manejo de errores implementado
- [ ] Logging y auditoría configurados
- [ ] Pruebas realizadas
- [ ] Documentación actualizada
- [ ] Despliegue en producción
- [ ] Monitoreo configurado

---

**Fin del Documento**

*Este documento es un contrato técnico entre CORHUILA Plus y la Plataforma de Egresados CORHUILA. Cualquier modificación debe ser acordada por ambas partes.*



