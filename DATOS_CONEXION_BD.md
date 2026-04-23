# Datos de Conexión a la Base de Datos
## Plataforma de Egresados CORHUILA

---

## 🔐 Información de Conexión

### Configuración Básica

| Parámetro | Valor |
|-----------|-------|
| **Tipo de Base de Datos** | PostgreSQL 15 |
| **Host** | `localhost` (o `127.0.0.1`) |
| **Puerto** | `5432` |
| **Nombre de la Base de Datos** | `egresados` |
| **Usuario** | `postgres` |
| **Contraseña** | `postgres` |

### URL de Conexión JDBC

```
jdbc:postgresql://localhost:5432/egresados?stringtype=unspecified
```

### URL de Conexión Completa (con parámetros UTF-8)

```
jdbc:postgresql://localhost:5432/egresados?stringtype=unspecified&useUnicode=true&characterEncoding=UTF-8
```

---

## 🔧 Conexión desde Herramientas

### 1. DBeaver / pgAdmin / DataGrip

**Configuración:**
- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `egresados`
- **Username:** `postgres`
- **Password:** `postgres`
- **SSL Mode:** `disable` (desarrollo local)

### 2. psql (Línea de Comandos)

```bash
psql -h localhost -p 5432 -U postgres -d egresados
```

Cuando te pida la contraseña, ingresa: `postgres`

### 3. Python (psycopg2)

```python
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="egresados",
    user="postgres",
    password="postgres"
)
```

### 4. Node.js (pg)

```javascript
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'egresados',
  user: 'postgres',
  password: 'postgres'
});

client.connect();
```

### 5. Java/JDBC

```java
String url = "jdbc:postgresql://localhost:5432/egresados?stringtype=unspecified";
String user = "postgres";
String password = "postgres";

Connection conn = DriverManager.getConnection(url, user, password);
```

---

## 📋 Verificación de Conexión

### Verificar que el contenedor está corriendo

```bash
docker ps
```

Deberías ver un contenedor con la imagen `postgres:15-alpine` en el puerto `5432:5432`.

### Probar conexión desde terminal

```bash
# Si tienes psql instalado localmente
psql -h localhost -p 5432 -U postgres -d egresados -c "SELECT version();"
```

### Probar conexión desde Docker

```bash
# Entrar al contenedor de la base de datos
docker exec -it <nombre_contenedor_db> psql -U postgres -d egresados

# O si estás en el directorio deploy/
docker compose exec db psql -U postgres -d egresados
```

---

## 🗄️ Estructura de la Base de Datos

### Tablas Principales

- `graduates` - Información de egresados
- `programs` - Programas académicos de egresados
- `news` - Noticias publicadas
- `job_offers` - Ofertas de empleo
- `events` - Eventos
- `admin_users` - Usuarios administradores
- `countries` - Catálogo de países
- `cities` - Catálogo de ciudades
- `sectors` - Catálogo de sectores industriales
- `contract_types` - Tipos de contrato
- `faculties` - Catálogo de facultades
- `program_catalog` - Catálogo de programas académicos

### Consultas Útiles

```sql
-- Ver todas las tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Ver estructura de la tabla graduates
\d graduates

-- Contar egresados
SELECT COUNT(*) FROM graduates;

-- Ver egresados recientes
SELECT id, identificacion, nombre_legal, creado_en 
FROM graduates 
ORDER BY creado_en DESC 
LIMIT 10;
```

---

## ⚠️ Notas Importantes

### Seguridad

⚠️ **ADVERTENCIA:** Estas credenciales son para **desarrollo local únicamente**. 

- En producción, **NUNCA** uses estas credenciales
- Cambia las contraseñas por defecto
- Usa variables de entorno para credenciales
- Implementa SSL/TLS para conexiones remotas

### Variables de Entorno

El proyecto usa variables de entorno para la configuración. Puedes verlas en:
- `deploy/docker-compose.yml` (para Docker)
- `backend/src/main/resources/application.yml` (valores por defecto)

### Puerto Expuesto

El puerto `5432` está expuesto en el host, por lo que puedes conectarte desde cualquier herramienta cliente de PostgreSQL instalada en tu máquina local.

---

## 🔄 Si el Contenedor No Está Corriendo

### Iniciar los contenedores

```bash
cd deploy
docker compose up -d
```

### Ver logs de la base de datos

```bash
cd deploy
docker compose logs db
```

### Reiniciar solo la base de datos

```bash
cd deploy
docker compose restart db
```

---

## 📞 Soporte

Si tienes problemas de conexión:

1. Verifica que Docker esté corriendo
2. Verifica que el contenedor de PostgreSQL esté activo: `docker ps`
3. Verifica que el puerto 5432 no esté en uso por otro servicio
4. Revisa los logs: `docker compose logs db`

---

**Última actualización:** Noviembre 2025




