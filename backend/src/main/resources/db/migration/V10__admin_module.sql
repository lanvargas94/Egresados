-- Agregar campos de administración a graduates
alter table if exists graduates 
    add column if not exists estado varchar(20) default 'ACTIVO',
    add column if not exists observaciones_internas text;

create index if not exists idx_graduates_estado on graduates(estado);

-- Actualizar tabla job_offers con nuevos campos
alter table if exists job_offers
    add column if not exists descripcion text,
    add column if not exists ciudad varchar(100),
    add column if not exists modalidad varchar(20),
    add column if not exists rango_salarial varchar(100),
    add column if not exists fecha_inicio_publicacion timestamptz,
    add column if not exists fecha_fin_publicacion timestamptz;

-- Migrar datos existentes: descripcion desde resumen, fecha_inicio_publicacion desde fecha_cierre
update job_offers set descripcion = resumen where descripcion is null and resumen is not null;
update job_offers set fecha_inicio_publicacion = fecha_cierre::timestamptz where fecha_inicio_publicacion is null and fecha_cierre is not null;
update job_offers set modalidad = 'PRESENCIAL' where modalidad is null;

-- Actualizar tabla events con nuevos campos
alter table if exists events
    add column if not exists nombre varchar(200),
    add column if not exists fecha_hora_inicio timestamptz,
    add column if not exists fecha_hora_fin timestamptz,
    add column if not exists tipo_evento varchar(20),
    add column if not exists enlace_conexion varchar(500),
    add column if not exists lugar_fisico varchar(300),
    add column if not exists capacidad int;

-- Migrar datos existentes: nombre desde titulo, fecha_hora a fecha_hora_inicio
update events set nombre = titulo where nombre is null;
update events set fecha_hora_inicio = fecha_hora where fecha_hora_inicio is null;
update events set tipo_evento = 'PRESENCIAL' where tipo_evento is null and lugar is not null;
update events set tipo_evento = 'VIRTUAL' where tipo_evento is null and enlace_virtual is not null;
update events set lugar_fisico = lugar where lugar_fisico is null and lugar is not null;
update events set enlace_conexion = enlace_virtual where enlace_conexion is null and enlace_virtual is not null;
update events set capacidad = cupos where capacidad is null and cupos is not null;

-- Tabla banners
create table if not exists banners (
    id uuid primary key,
    titulo varchar(200) not null,
    subtitulo varchar(300),
    imagen_url varchar(500),
    enlace_accion varchar(500),
    orden int default 0,
    activo boolean not null default true,
    creado_en timestamptz not null,
    actualizado_en timestamptz not null
);

create index if not exists idx_banners_activo_orden on banners(activo, orden);

-- Tabla admin_users
create table if not exists admin_users (
    id uuid primary key,
    username varchar(100) not null unique,
    password varchar(255) not null,
    nombre varchar(200),
    correo varchar(200),
    role varchar(20) not null,
    activo boolean not null default true,
    creado_en timestamptz,
    ultimo_acceso timestamptz
);

create index if not exists idx_admin_users_username on admin_users(username);
create index if not exists idx_admin_users_role on admin_users(role);

-- Tabla admin_user_programas (para ADMIN_PROGRAMA)
create table if not exists admin_user_programas (
    admin_user_id uuid not null references admin_users(id) on delete cascade,
    programa varchar(150) not null,
    primary key (admin_user_id, programa)
);

create index if not exists idx_admin_user_programas_user on admin_user_programas(admin_user_id);

-- Usuario admin inicial (password: Admin12345)
insert into admin_users(id, username, password, nombre, correo, role, activo, creado_en)
values (
    '00000000-0000-0000-0000-000000000001',
    'admin',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwEj3.ZG', -- BCrypt hash de Admin12345
    'Administrador General',
    'admin@corhuila.edu.co',
    'ADMIN_GENERAL',
    true,
    now()
) on conflict (username) do nothing;

