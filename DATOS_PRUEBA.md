# Datos de Prueba - Plataforma de Egresados CORHUILA

## Usuarios Administradores

### 1. Administrador General
- **Usuario:** `admin`
- **Contraseña:** `Admin12345`
- **Rol:** `ADMIN_GENERAL`
- **Permisos:** Acceso completo a todas las funcionalidades administrativas
- **Email:** admin@corhuila.edu.co
- **Estado:** ✅ Funcionando correctamente

### 2. Administrador de Programa
- **Usuario:** `admin.programa`
- **Contraseña:** `Programa123`
- **Rol:** `ADMIN_PROGRAMA`
- **Permisos:** Acceso limitado a funcionalidades de programas asignados
- **Programas asignados:**
  - Ingeniería de Sistemas
  - Ingeniería Industrial
- **Email:** admin.programa@corhuila.edu.co
- **Estado:** ✅ Funcionando correctamente

**Nota:** Las contraseñas se generan automáticamente al iniciar el backend mediante `DataInitializer.java`. Si necesitas regenerar las contraseñas, reinicia el contenedor del backend.

---

## Usuarios Egresados

### 1. Egresado con Onboarding Completo
- **Número de Identificación:** `1234567890`
- **Nombre:** Juan Pérez García
- **Email:** juan.perez@ejemplo.com
- **País:** CO (Colombia)
- **Ciudad:** Neiva
- **Teléfono:** +573001234567
- **Situación Laboral:** EMPLEADO
- **Industria:** Tecnología
- **Empresa:** Empresa Ejemplo S.A.S
- **Cargo:** Desarrollador Senior
- **Programa:** Ingeniería de Sistemas (2020)
- **Estado:** ACTIVO
- **Onboarding:** ✅ Completo
- **Email Verificado:** ✅ Sí
- **Estado:** ✅ Funcionando correctamente

### 2. Egresado sin Onboarding Completo
- **Número de Identificación:** `9876543210`
- **Nombre:** María González López
- **Programa:** Administración de Empresas (2019)
- **Estado:** ACTIVO
- **Onboarding:** ❌ Pendiente (seguirá el flujo de onboarding)
- **Email Verificado:** ❌ No
- **Estado:** ✅ Funcionando correctamente

---

## Flujos de Prueba

### Para Egresados:
1. **Identificación:** Ir a `/` e ingresar el número de identificación
   - `1234567890` → Irá directamente al Panel (onboarding completo)
   - `9876543210` → Irá al Onboarding paso 1

2. **Onboarding:** Completa los 3 pasos si es necesario
   - Paso 1: Contacto (email, teléfono, país, ciudad)
   - Paso 2: Información laboral
   - Paso 3: Consentimiento de datos

3. **Panel del Egresado:** Acceso a:
   - Ver/Editar perfil
   - Ver noticias, ofertas de empleo, eventos
   - Descargar constancia de egresado

### Para Administradores:
1. **Login:** Ir a `/admin/login`
   - Usar credenciales de `admin` o `admin.programa`
   
2. **Funcionalidades ADMIN_GENERAL (`admin`):**
   - Gestión de egresados (listar, ver, editar, cambiar estado)
   - Gestión de noticias
   - Gestión de ofertas de empleo
   - Gestión de eventos
   - Gestión de banners
   - Gestión de usuarios administradores
   - Gestión de catálogos
   - Reportes y auditoría

3. **Funcionalidades ADMIN_PROGRAMA (`admin.programa`):**
   - Gestión limitada a programas asignados
   - Sin acceso a gestión de usuarios admin ni reportes completos

---

## Notas Importantes

- **Password Hashing:** Las contraseñas se almacenan usando BCrypt
- **JWT Tokens:** La autenticación utiliza JWT tokens
- **Base de Datos:** Los datos se crean automáticamente mediante migraciones Flyway
- **Inicialización:** El usuario `admin.programa` se crea/actualiza automáticamente al iniciar el backend

---

## URLs Importantes

- **Frontend:** http://localhost:3002
- **Backend API:** http://localhost:8080/api
- **Login Admin:** http://localhost:3002/admin/login
- **Login Egresado:** http://localhost:3002/

