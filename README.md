Egresados – CORHUILA (Monorepo)

Estructura inicial de la plataforma con backend Spring Boot (arquitectura hexagonal), PostgreSQL y Docker Compose. El frontend Angular será añadido en el siguiente paso.

Estructura
- `backend/`: API Spring Boot (hexagonal: dominio/puertos/casos de uso/adaptadores)
- `deploy/`: `docker-compose.yml` para Postgres y backend
- `frontend/`: (pendiente) Angular app con módulos Onboarding, Perfil, Noticias, Empleos, Eventos y Admin

Requisitos
- Docker y Docker Compose
- (Opcional) Java 17 y Maven para ejecutar local fuera de Docker

Ejecución rápida (Docker)
1. Ir a `deploy/`
2. `docker compose up --build`
3. API disponible en `http://localhost:8080` y Swagger en `http://localhost:8080/swagger`

Configuración de Base de Datos
- Variables: `DB_URL`, `DB_USER`, `DB_PASSWORD` en el servicio backend (ver `deploy/docker-compose.yml`)
- Migraciones con Flyway en `backend/src/main/resources/db/migration`

Endpoints base (v0)
- POST `/api/auth/identify` { numeroIdentificacion }
  - Respuestas: `status: onboarding | panel | no_encontrado | bloqueo`, `graduateId`, `nombre`
  - Mock de Corhuilaplus: documento `123456789` retorna un egresado de ejemplo
- PUT `/api/onboarding/step1` Paso 1 (contacto)
- PUT `/api/onboarding/step2` Paso 2 (laboral)
- PUT `/api/onboarding/step3` Paso 3 (consentimiento) → marca Onboarding completo (RN-O02)
- GET `/api/news` Lista de noticias publicadas y vigentes (RN-N01)

Arquitectura (Hexagonal)
- Dominio: modelos y puertos en `com.corhuila.egresados.domain.*`
- Casos de uso: `com.corhuila.egresados.application.*`
- Adaptadores:
  - REST: `com.corhuila.egresados.infrastructure.rest.*`
  - Persistencia JPA: `com.corhuila.egresados.infrastructure.persistence.*`
  - Integraciones: `com.corhuila.egresados.infrastructure.integration.*` (Mock de Corhuilaplus)

Siguientes pasos
- Frontend Angular (onboarding en 3 pasos, panel y consultas)
- Módulos Admin (CRUD Noticias/Empleos/Eventos + reglas)
- OTP por correo para reingreso (2.2)
- Reportes, Analítica y Comunicación por campañas

