# Egresados - CORHUILA (Monorepo)

Plataforma monorepo con backend Spring Boot (arquitectura hexagonal), frontend Angular, PostgreSQL y Mailhog, orquestados con Docker Compose.

## Estructura del repositorio

- `backend/`: API Spring Boot (dominios, puertos, casos de uso, adaptadores).
- `frontend/`: app Angular servida con Nginx en Docker.
- `deploy/`: `docker-compose.yml` para todos los servicios (db, backend, frontend, mailhog).
- `DATOS_PRUEBA.md`: usuarios y datos de prueba listos para validar flujos.

## Requisitos previos

1. Git 2.x para clonar.
2. Docker Desktop / Docker Engine 24+ con Docker Compose v2.
3. (Opcional) Java 17 y Maven 3.9+ si quieres correr el backend fuera de Docker.
4. (Opcional) Node 18+ si quieres correr el frontend en modo desarrollo.

Verifica versiones:

```bash
git --version
docker --version
docker compose version
mvn -v        # Solo si usaras Maven
node -v       # Solo si usaras el frontend local
```

## Puertos y colisiones frecuentes

- 3002: frontend (Nginx). Si ya usas 3002, cambia el mapeo del servicio `frontend` en `deploy/docker-compose.yml` (ej. `3005:80`).
- 5432: PostgreSQL. Si tienes otro Postgres en 5432, cambia el mapeo `5432:5432` (ej. `5440:5432`) y ajusta tus clientes externos.
- 1025 (SMTP) y 8025 (UI): Mailhog. Cambia los mapeos si los tienes ocupados.
- 8080: Backend (expuesto directamente para acceso a Swagger y pruebas de API). Accede a `http://localhost:8080/swagger-ui.html` para la documentación interactiva.

## Variables clave en `deploy/docker-compose.yml`

Backend:
- `DB_URL=jdbc:postgresql://db:5432/egresados`
- `DB_USER=postgres`
- `DB_PASSWORD=postgres`
- `PORT=8080`
- `JWT_SECRET` y `JWT_EXP_MS` (token dev por defecto)
- `FRONT_ORIGIN=http://localhost:3002`
- `MAIL_*` y `APP_CONFIRM_URL` apuntan a Mailhog y al frontend

Base de datos:
- `POSTGRES_DB=egresados`
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=postgres`

Ajusta estos valores si cambias puertos o credenciales.

## Paso a paso (Docker Compose)

1) Clonar y entrar  
```bash
git clone https://github.com/lanvargas94/Egresados.git
cd Egresados
```

2) Levantar servicios  
```bash
cd deploy
docker compose up --build
# o en segundo plano
docker compose up --build -d
```
- Construye frontend y backend, levanta PostgreSQL y Mailhog, y aplica migraciones Flyway.
- Si algun puerto ya esta en uso, edita los mapeos en `deploy/docker-compose.yml` antes de ejecutar el comando.

3) Verificar  
- Frontend: `http://localhost:3002` (UI y peticiones /api proxied al backend).
- Mailhog UI: `http://localhost:8025` (correos dev). SMTP en `localhost:1025`.
- Logs: `docker compose logs -f backend` o `docker compose logs -f frontend`.
- Datos/usuarios de prueba: ver `DATOS_PRUEBA.md`.

4) Detener  
```bash
docker compose down
# agrega -v si quieres borrar el volumen de datos de Postgres
```

## Ejecucion manual (opcional)

### Backend sin Docker
1. Tener Postgres disponible y la base `egresados`.
2. Variables de entorno:
```bash
export DB_URL=jdbc:postgresql://localhost:5432/egresados
export DB_USER=postgres
export DB_PASSWORD=postgres
export JWT_SECRET=this_is_a_dev_secret_key_at_least_32_chars_long
export JWT_EXP_MS=86400000
export MAIL_HOST=localhost
export MAIL_PORT=1025
export MAIL_AUTH=false
export MAIL_STARTTLS=false
export MAIL_FROM=no-reply@egresados.local
export APP_CONFIRM_URL=http://localhost:3002/confirmar?token=
```
3. Ejecutar desde `backend/`:
```bash
mvn clean package
java -jar target/egresados*.jar
# o
mvn spring-boot:run
```
4. API en `http://localhost:8080` (ajusta `PORT` si cambias).

### Frontend sin Docker
```bash
cd frontend
npm install
npm start
```
- Servira en `http://localhost:4200`.
- El `environment.ts` usa `/api`; para desarrollo local asegurate de que el backend este accesible en el mismo host (puedes agregar un proxy o mapear el backend a 3001 y configurar ese puerto).

## Migraciones de base de datos

- Carpeta: `backend/src/main/resources/db/migration`.
- Flyway corre al iniciar el backend, tanto en Docker como con Maven.
- Nuevas migraciones: agrega archivos `VXX__descripcion.sql`.

## Funcionalidades del Sistema

### 🔐 Autenticación y Autorización

#### Para Egresados:
- **Identificación por número de documento**: Verificación de egresado en el sistema
- **Autenticación OTP (One-Time Password)**: Sistema de login seguro mediante código temporal enviado por email
  - Solicitud de código OTP con límites de seguridad (máx. 5 por hora, cooldown de 60 segundos)
  - Validación de código con protección contra intentos fallidos (máx. 5 intentos)
  - Tokens JWT para sesiones autenticadas
- **Confirmación de email**: Verificación de correo electrónico con tokens seguros
- **Reenvío de confirmación**: Solicitud de nuevo correo de confirmación

#### Para Administradores:
- **Login con usuario y contraseña**: Autenticación tradicional para administradores
- **Roles y permisos**: Sistema de roles (`ADMIN_GENERAL`, `ADMIN_PROGRAMA`)
  - `ADMIN_GENERAL`: Acceso completo a todas las funcionalidades
  - `ADMIN_PROGRAMA`: Acceso limitado a programas asignados
- **Gestión de usuarios administradores**: CRUD completo de usuarios admin

### 👤 Gestión de Perfil de Egresados

- **Onboarding en 3 pasos**:
  - **Paso 1**: Datos de contacto (email, teléfono, país, ciudad)
  - **Paso 2**: Información laboral (situación, industria, empresa, cargo)
  - **Paso 3**: Consentimiento de datos y preferencias de comunicación
- **Actualización de perfil**: Modificación de datos personales y profesionales
- **Selección de ciudad dinámica**: Dropdown de ciudades que se actualiza automáticamente según el país seleccionado
- **Historial de cambios**: Registro de todas las modificaciones realizadas al perfil
- **Preferencias de comunicación**:
  - Interés en noticias de facultad
  - Interés en eventos de ciudad
  - Interés en ofertas de empleo por sector
  - Interés en posgrados
- **Descarga de constancia**: Generación de PDF con constancia de egresado
- **Estados de egresado**: `ACTIVO`, `BLOQUEADO`, `INACTIVO`

### 📰 Gestión de Noticias

#### Para Egresados:
- **Listado de noticias**: Visualización de noticias publicadas y vigentes
- **Filtrado por facultad y programa**: Noticias segmentadas según perfil del egresado
- **Detalle de noticia**: Visualización completa de contenido
- **Visualización de imágenes**: Imágenes de noticias servidas directamente desde el servidor
- **Descarga de adjuntos**: Archivos adjuntos descargables desde noticias publicadas

#### Para Administradores:
- **CRUD completo de noticias**: Crear, leer, actualizar y eliminar
- **Estados de noticia**: `BORRADOR`, `PROGRAMADA`, `PUBLICADA`, `ARCHIVADA`
- **Programación de publicación**: Publicación automática en fecha/hora específica
- **Gestión de imágenes**: Subida y eliminación de imágenes asociadas
- **Gestión de adjuntos**: Subida y eliminación de archivos adjuntos
- **Auto-publicación**: Tarea programada que publica noticias programadas automáticamente
- **Endpoints de archivos**: Servicio seguro de imágenes y adjuntos con validación de estado

### 💼 Gestión de Ofertas de Empleo

#### Para Egresados:
- **Listado de ofertas**: Visualización de ofertas publicadas
- **Filtrado avanzado**: Por estado, sector, empresa, tipo de contrato, búsqueda de texto, rango de fechas
- **Detalle de oferta**: Información completa de la oferta
- **Marcar interés**: Sistema para indicar interés en una oferta de empleo
- **Estadísticas de ofertas**: Visualización de datos de interés por oferta

#### Para Administradores:
- **CRUD completo de ofertas**: Crear, leer, actualizar y eliminar
- **Estados de oferta**: `BORRADOR`, `PUBLICADA`, `VENCIDA`, `ARCHIVADA`, `CERRADA`
- **Publicación de ofertas**: Cambio de estado a publicada
- **Archivado de ofertas**: Gestión de ofertas antiguas
- **Cierre de ofertas**: Finalización manual de ofertas
- **Expiración automática**: Tarea programada que marca ofertas como vencidas según fecha de cierre
- **Exportación de intereses**: Descarga de lista de egresados interesados en una oferta (CSV/Excel)

### 📅 Gestión de Eventos

#### Para Egresados:
- **Listado de eventos**: Visualización de eventos publicados y vigentes
- **RSVP (Reserva de cupo)**: Registro para asistir a eventos
- **Cancelación de RSVP**: Anulación de reserva
- **Lista de espera**: Inscripción en lista de espera cuando el evento está lleno
- **Información de cupos**: Visualización de cupos disponibles y restantes

#### Para Administradores:
- **CRUD completo de eventos**: Crear, leer, actualizar y eliminar
- **Estados de evento**: `BORRADOR`, `PUBLICADA`, `FINALIZADA`, `ARCHIVADA`
- **Publicación de eventos**: Cambio de estado a publicada
- **Archivado de eventos**: Gestión de eventos pasados
- **Finalización automática**: Tarea programada que marca eventos como finalizados después de su fecha/hora de fin
- **Exportación de asistentes**: Descarga de lista de egresados registrados (CSV/Excel)
- **Estadísticas de eventos**: Visualización de datos de asistencia y registros

### 📊 Analytics y Reportes

#### Analytics:
- **Demografía**: Estadísticas de egresados por facultad, programa y año
- **Empleabilidad**: Porcentajes de situación laboral (empleado, desempleado, emprendedor, etc.)
- **Adopción de la plataforma**: 
  - Gráficos de actualizaciones de perfil por mes
  - Gráficos de completado de onboarding por mes
  - Filtros por rango de fechas

#### Reportes:
- **Exportación de datos de egresados**: 
  - Exportación en formato CSV o Excel (XLSX)
  - Filtros avanzados (facultad, programa, año, país, ciudad, sector, situación laboral, fechas)
  - Selección de campos a exportar
  - Validación de exportaciones masivas (requiere justificación para >5000 registros)
- **Reportes predefinidos**:
  - Egresados por programa
  - Egresados por año de graduación
  - Egresados por estado
  - Registros a eventos
- **Historial de exportaciones**: Registro de todas las exportaciones realizadas con auditoría

### 🔍 Gestión de Egresados (Admin)

- **Listado con filtros**: Búsqueda por programa, año de graduación, estado, ciudad, identificación, nombre
- **Paginación**: Navegación eficiente de grandes volúmenes de datos
- **Detalle de egresado**: Visualización completa de información
- **Actualización de datos**: Modificación de información de contacto y observaciones
- **Cambio de estado**: Activación, bloqueo o desactivación de egresados
- **Correo masivo**: Envío de correos a todos los egresados verificados con adjuntos opcionales

### 📚 Gestión de Catálogos

#### Catálogos Públicos (para egresados):
- **Países**: Listado de países disponibles
- **Ciudades**: Listado de ciudades por país
- **Facultades**: Listado de facultades
- **Programas**: Listado de programas por facultad
- **Sectores**: Listado de sectores económicos
- **Tipos de contrato**: Listado de tipos de contrato laboral

#### Gestión de Catálogos (Admin):
- **Facultades**: CRUD completo
- **Programas**: CRUD completo con asociación a facultades
- **Ciudades**: CRUD completo con asociación a países
- **Sectores**: CRUD completo con activación/desactivación
- **Tipos de contrato**: CRUD completo con activación/desactivación

### 📝 Auditoría

- **Registro de acciones**: Log de todas las operaciones administrativas
- **Filtrado y búsqueda**: Búsqueda de registros por acción, entidad, usuario, fecha
- **Paginación**: Navegación de registros de auditoría
- **Información registrada**: Usuario, acción, entidad, ID, descripción, fecha/hora

### ✅ Validaciones Públicas

- **Validación de email**: Verificación de disponibilidad de correo electrónico

### 🔄 Tareas Programadas (Scheduled Tasks)

- **Expiración de ofertas de empleo**: Ejecuta cada hora, marca ofertas vencidas según fecha de cierre
- **Finalización de eventos**: Ejecuta cada 10 minutos, marca eventos como finalizados después de su fecha/hora de fin
- **Auto-publicación de noticias**: Ejecuta cada minuto, publica noticias programadas que alcanzaron su fecha/hora de publicación

### 📧 Sistema de Correo Electrónico

- **Envío de correos HTML**: Notificaciones con formato HTML
- **Confirmación de email**: Envío de enlaces de confirmación
- **Códigos OTP**: Envío de códigos de autenticación
- **Correo masivo a egresados**: 
  - Envío de correos a todos los egresados verificados
  - Soporte para adjuntos (documentos e imágenes)
  - Personalización de contenido con variables
  - Validación de tamaño de archivos (máx. 2MB por archivo)
  - Estadísticas de envío (exitosos/fallidos)
- **Adjuntos en correos**: 
  - Documentos adjuntos descargables
  - Imágenes inline embebidas en el HTML
  - Soporte para múltiples formatos (PDF, DOC, imágenes JPG/PNG)
- **Integración con Mailhog**: Captura de correos en desarrollo para pruebas

### 🛡️ Seguridad

- **JWT Tokens**: Autenticación basada en tokens
- **BCrypt**: Hash seguro de contraseñas
- **Protección CSRF**: Configuración de seguridad
- **Validación de datos**: Validación de entrada en todos los endpoints
- **Manejo de excepciones**: Gestión centralizada de errores
- **Límites de rate limiting**: Protección contra abuso en OTP y otras funcionalidades

## Endpoints Principales

### Autenticación
- `POST /api/auth/identify` - Identificación de egresado
- `POST /api/auth/request-otp` - Solicitud de código OTP
- `POST /api/auth/login-otp` - Login con código OTP
- `POST /api/admin/auth/login` - Login de administrador

### Onboarding
- `PUT /api/onboarding/step1` - Paso 1: Datos de contacto
- `PUT /api/onboarding/step2` - Paso 2: Información laboral
- `PUT /api/onboarding/step3` - Paso 3: Consentimiento

### Perfil
- `GET /api/profile` - Obtener perfil
- `PUT /api/profile` - Actualizar perfil
- `GET /api/profile/history` - Historial de cambios
- `POST /api/profile/confirm-email` - Confirmar email
- `POST /api/profile/resend-confirmation` - Reenviar confirmación
- `GET /api/profile/certificate` - Descargar constancia PDF

### Noticias
- `GET /api/news` - Listar noticias (público)
- `GET /api/news/{id}` - Detalle de noticia
- `GET /api/news/{id}/image` - Obtener imagen de noticia (público, solo noticias publicadas)
- `GET /api/news/{id}/attachment` - Descargar adjunto de noticia (público, solo noticias publicadas)
- `GET /api/admin/news` - Listar noticias (admin)
- `POST /api/admin/news` - Crear noticia
- `PUT /api/admin/news/{id}` - Actualizar noticia
- `POST /api/admin/news/{id}/publish` - Publicar noticia
- `POST /api/admin/news/{id}/schedule` - Programar publicación

### Ofertas de Empleo
- `GET /api/jobs` - Listar ofertas (público)
- `GET /api/jobs/{id}` - Detalle de oferta
- `POST /api/jobs/{id}/interest` - Marcar interés
- `GET /api/admin/jobs` - Listar ofertas (admin)
- `POST /api/admin/jobs` - Crear oferta
- `PUT /api/admin/jobs/{id}` - Actualizar oferta
- `POST /api/admin/jobs/{id}/publish` - Publicar oferta

### Eventos
- `GET /api/events` - Listar eventos (público)
- `POST /api/events/{id}/rsvp` - Reservar cupo
- `DELETE /api/events/{id}/rsvp` - Cancelar reserva
- `POST /api/events/{id}/waitlist` - Unirse a lista de espera
- `GET /api/admin/events` - Listar eventos (admin)
- `POST /api/admin/events` - Crear evento

### Analytics
- `GET /api/admin/analytics/demografia` - Estadísticas demográficas
- `GET /api/admin/analytics/empleabilidad` - Estadísticas de empleabilidad
- `GET /api/admin/analytics/adopcion` - Estadísticas de adopción

### Reportes
- `POST /api/admin/reports/export` - Exportar datos de egresados
- `GET /api/admin/reports/logs` - Historial de exportaciones
- `GET /api/admin/reports/graduates-by-program` - Reporte por programa
- `GET /api/admin/reports/graduates-by-year` - Reporte por año
- `GET /api/admin/reports/graduates-by-status` - Reporte por estado
- `GET /api/admin/reports/event-registrations` - Reporte de registros a eventos

### Gestión de Egresados (Admin)
- `GET /api/admin/graduates` - Listar egresados con filtros
- `GET /api/admin/graduates/{id}` - Detalle de egresado
- `PUT /api/admin/graduates/{id}` - Actualizar egresado
- `POST /api/admin/graduates/bulk-email` - Enviar correo masivo a egresados

### Catálogos
- `GET /api/catalog/countries` - Listar países
- `GET /api/catalog/cities` - Listar ciudades (filtrado por país)
- `GET /api/catalog/faculties` - Listar facultades
- `GET /api/catalog/programs` - Listar programas
- `GET /api/catalog/sectors` - Listar sectores
- `GET /api/catalog/contract-types` - Listar tipos de contrato

### Documentación API (Swagger/OpenAPI)

**✅ USAR SIEMPRE - Acceso directo al backend:**
- **Swagger UI**: `http://localhost:8080/swagger-ui.html` - Interfaz interactiva para probar endpoints
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs` - Especificación OpenAPI en formato JSON
- **OpenAPI YAML**: `http://localhost:8080/v3/api-docs.yaml` - Especificación OpenAPI en formato YAML

> **⚠️ IMPORTANTE**: Usa siempre el puerto **8080** (acceso directo al backend). Si intentas acceder a través del puerto 3002 (frontend), Angular puede redirigirte a la página de identificación debido a su sistema de routing. El backend está expuesto directamente en el puerto 8080 para facilitar el acceso a Swagger y pruebas de API.

#### Características de la documentación:
- ✅ Documentación completa de todos los endpoints
- ✅ Esquemas de request/response
- ✅ Ejemplos de peticiones y respuestas
- ✅ Autenticación JWT integrada (botón "Authorize" en Swagger UI)
- ✅ Agrupación por tags (Autenticación, Onboarding, Noticias, etc.)
- ✅ Códigos de estado HTTP documentados
- ✅ Validaciones y restricciones documentadas
- ✅ Pruebas directas desde el navegador

#### Uso de Swagger UI:
1. **Accede directamente al backend**: `http://localhost:8080/swagger-ui.html`
   - ⚠️ NO uses `http://localhost:3002/swagger-ui.html` (te redirigirá a la página de identificación)
2. Para probar endpoints protegidos:
   - Haz clic en el botón **"Authorize"** (🔒) en la parte superior
   - Ingresa el token JWT obtenido de `/api/auth/identify` o `/api/admin/auth/login`
   - El formato es: `Bearer <tu-token-jwt>` (o simplemente `<tu-token-jwt>`)
   - Haz clic en "Authorize" y luego "Close"
3. Explora los endpoints agrupados por categorías
4. Prueba los endpoints directamente desde la interfaz

## Credenciales y datos de prueba

- Ver `DATOS_PRUEBA.md` para usuarios admin, egresados y flujos guiados.
- Base de datos por defecto (Docker): `Host localhost`, `Puerto 5432`, `DB egresados`, `Usuario postgres`, `Password postgres`. Si cambiaste el puerto de exposicion, usa el nuevo.

## Notas Importantes

- **Mailhog**: Captura todos los correos en desarrollo, revisa confirmaciones y códigos OTP en `http://localhost:8025`. Los correos con adjuntos se pueden ver en la interfaz de Mailhog, incluyendo imágenes inline y documentos adjuntos.
- **Exposición del backend**: El backend está expuesto directamente en el puerto 8080 para facilitar el acceso a Swagger y pruebas de API. Accede a `http://localhost:8080/swagger-ui.html` para la documentación interactiva.
- **Almacenamiento persistente**: Los archivos subidos (imágenes de noticias, adjuntos, etc.) se almacenan en un volumen Docker persistente (`uploads_data`) para evitar pérdida de datos al reconstruir contenedores.
- **Codificación UTF-8**: El sistema está configurado para manejar correctamente caracteres especiales (tildes, ñ) en toda la aplicación, tanto en la base de datos como en las respuestas HTTP.
- **Tareas programadas**: El sistema ejecuta tareas automáticas en segundo plano (expiración de ofertas, finalización de eventos, auto-publicación de noticias).
- **Auditoría**: Todas las acciones administrativas se registran automáticamente para trazabilidad.
- **Seguridad**: El sistema implementa múltiples capas de seguridad (JWT, BCrypt, validaciones, rate limiting).
- **Exportaciones masivas**: Las exportaciones de más de 5,000 registros requieren justificación y se registran en el historial.
- **Correo masivo**: El envío de correos masivos incluye validación de tamaño de archivos (máx. 2MB por archivo) y genera estadísticas de envío (exitosos/fallidos).

## Arquitectura

- **Backend**: Arquitectura hexagonal (puertos y adaptadores) con Spring Boot
- **Frontend**: Angular con componentes modulares y guards de autenticación
- **Base de datos**: PostgreSQL con migraciones Flyway
- **Orquestación**: Docker Compose para desarrollo y despliegue
- **Almacenamiento**: Volúmenes Docker persistentes para archivos subidos
- **Documentación API**: Swagger/OpenAPI 3.0 completamente configurado con:
  - Documentación interactiva de todos los endpoints
  - Autenticación JWT integrada
  - Ejemplos de request/response
  - Esquemas de datos completos
  - Agrupación por tags y categorías
  - Organización profesional con tags numéricos para orden lógico
- **Servicio de correo**: Integración con Mailhog para desarrollo, configurable para SMTP real en producción
- **Codificación**: UTF-8 estandarizado en toda la aplicación (backend, frontend, base de datos)
