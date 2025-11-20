# Egresados - CORHUILA (Monorepo)

Plataforma monorepo con backend Spring Boot (arquitectura hexagonal), PostgreSQL y despliegue via Docker Compose. En un siguiente hito se anexara el frontend Angular con los modulos de Onboarding, Perfil, Noticias, Empleos, Eventos y Admin.

## Estructura del repositorio

- `backend/`: API Spring Boot organizada por dominio, puertos, casos de uso y adaptadores.
- `deploy/`: archivos Docker Compose para levantar PostgreSQL y el backend.
- `frontend/`: reservado para la app Angular (aun no disponible).

## Requisitos previos

1. Git 2.x para clonar y actualizar el repositorio.
2. Docker Desktop o Docker Engine 24+ con Docker Compose v2 incluido.
3. (Opcional) Java 17 y Maven 3.9+ si deseas compilar o ejecutar el backend fuera de Docker.

Comprueba las versiones con:

```bash
git --version
docker --version
docker compose version
mvn -v        # Solo si usaras Maven
java -version # Solo si usaras Java local
```

## Paso a paso para ejecutar en otro equipo (via Docker)

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/lanvargas94/Egresados.git
   cd Egresados
   ```
2. **Revisar configuraciones**  
   - El archivo `deploy/docker-compose.yml` expone PostgreSQL en el puerto 5432 y la API en 8080.  
   - Variables de entorno del servicio backend:
     - `DB_URL`: URL JDBC (por defecto `jdbc:postgresql://db:5432/egresados`).
     - `DB_USER`: usuario de la base (por defecto `egresados`).
     - `DB_PASSWORD`: contrasena del usuario (por defecto `egresados`).
   - Ajusta estos valores en `deploy/docker-compose.yml` si necesitas otras credenciales o puertos.
3. **Construir y levantar los servicios**
   ```bash
   cd deploy
   docker compose up --build
   ```
   Este comando crea las imagenes de backend y base de datos, corre migraciones Flyway y deja todo disponible en tu maquina. Para ejecutar en segundo plano agrega `-d`.
4. **Verificar que el backend esta activo**
   - API base: `http://localhost:8080/api/health` (siempre que exista un endpoint de salud) o cualquier otro endpoint descrito abajo.
   - Swagger UI: `http://localhost:8080/swagger`.
   - Logs: `docker compose logs -f backend`.
   - **Credenciales de prueba** (ver apartado siguiente) listas para autenticacion/mock.
5. **Detener los servicios cuando termines**
   ```bash
   docker compose down
   ```

## Ejecucion manual del backend (opcional)

Si prefieres no usar Docker o deseas depurar directamente en tu IDE:

1. Asegura un PostgreSQL disponible y crea la base `egresados`.
2. Define las variables de entorno antes de correr la aplicacion:
   ```bash
   export DB_URL=jdbc:postgresql://localhost:5432/egresados
   export DB_USER=egresados
   export DB_PASSWORD=egresados
   ```
3. Desde `backend/`, compila y ejecuta:
   ```bash
   mvn clean package
   java -jar target/egresados*.jar
   # o directamente
   mvn spring-boot:run
   ```
4. El backend quedara en `http://localhost:8080` igual que en Docker.

## Migraciones de base de datos

- Se encuentran en `backend/src/main/resources/db/migration`.
- Flyway se ejecuta automaticamente tanto en Docker como al iniciar la aplicacion con Maven.
- Para agregar cambios estructurales, crea nuevos archivos `VXX__descripcion.sql` en la carpeta mencionada.

## Endpoints base (v0)

- `POST /api/auth/identify` con `{ "numeroIdentificacion": "" }`. Respuestas: `status` (`onboarding`, `panel`, `no_encontrado`, `bloqueo`), `graduateId`, `nombre`. Hay un mock: documento `123456789` devuelve un egresado de ejemplo.
- `PUT /api/onboarding/step1` datos de contacto.
- `PUT /api/onboarding/step2` informacion laboral.
- `PUT /api/onboarding/step3` consentimiento, marca onboarding completo (RN-O02).
- `GET /api/news` obtiene noticias vigentes (RN-N01).

## Credenciales de prueba

Usa estos valores para validar los flujos sin afectar datos reales:

- Documento mock onboarding: `numeroIdentificacion = 123456789`.
- Usuario backend (por defecto en Docker): `DB_USER = egresados`, `DB_PASSWORD = egresados`.
- Credenciales de base de datos para administracion directa (`psql` o cliente GUI):
  ```bash
  Host: localhost
  Puerto: 5432
  Base: egresados
  Usuario: egresados
  Contrasena: egresados
  ```
Si necesitas usuarios adicionales, duplicalos en PostgreSQL o ajusta `deploy/docker-compose.yml`.

## Proximos pasos planificados

- Implementar el frontend Angular (Onboarding, Panel, Admin).
- Modulos Admin con CRUD de Noticias, Empleos y Eventos.
- OTP via correo para reingreso (2.2).
- Reportes, analitica y comunicaciones por campanas.
