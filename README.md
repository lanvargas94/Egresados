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
- El backend expone 8080 dentro de la red de Docker. No se publica hacia el host; accedes via frontend. Si necesitas llamarlo directo desde el host, agrega `ports: ["3001:8080"]` en el servicio `backend`.

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

## Endpoints base

- `POST /api/auth/identify` { "numeroIdentificacion": "" } -> `status` (`onboarding`, `panel`, `no_encontrado`, `bloqueo`), `graduateId`, `nombre` (mock para 123456789).
- `PUT /api/onboarding/step1` datos de contacto.
- `PUT /api/onboarding/step2` informacion laboral.
- `PUT /api/onboarding/step3` consentimiento (marca onboarding completo).
- `GET /api/news` noticias vigentes.
- Swagger: `/swagger` (via backend).

## Credenciales y datos de prueba

- Ver `DATOS_PRUEBA.md` para usuarios admin, egresados y flujos guiados.
- Base de datos por defecto (Docker): `Host localhost`, `Puerto 5432`, `DB egresados`, `Usuario postgres`, `Password postgres`. Si cambiaste el puerto de exposicion, usa el nuevo.

## Notas y proximos pasos

- Mailhog captura todos los correos en desarrollo, revisa confirmaciones en `http://localhost:8025`.
- Si necesitas exponer el backend al host para pruebas externas, publica el puerto en `deploy/docker-compose.yml` antes de levantar.
- Pendientes: evolutivos del admin, OTP, modulos adicionales y ajustes de UI/UX del frontend.
