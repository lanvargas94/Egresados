create table if not exists graduates (
    id uuid primary key,
    id_interno varchar(100),
    identificacion varchar(100) not null unique,
    nombre_legal varchar(200),
    correo_personal varchar(200),
    pais varchar(100),
    ciudad varchar(100),
    telefono_movil_e164 varchar(30),
    situacion_laboral varchar(30),
    industria varchar(120),
    empresa varchar(120),
    cargo varchar(120),
    aporte_mentoria boolean,
    aporte_ofertas boolean,
    aporte_conferencista boolean,
    int_noticias_facultad boolean,
    int_eventos_ciudad boolean,
    int_ofertas_sector boolean,
    int_posgrados boolean,
    correo_verificado boolean not null default false,
    consentimiento_datos boolean not null default false,
    onboarding_completo boolean not null default false,
    creado_en timestamptz,
    actualizado_en timestamptz
);

create table if not exists programs (
    id serial primary key,
    facultad varchar(150),
    programa varchar(150),
    anio int,
    graduate_id uuid references graduates(id) on delete cascade
);

create table if not exists news (
    id uuid primary key,
    titulo varchar(200) not null,
    resumen varchar(500),
    cuerpo_html text,
    fecha_publicacion timestamptz,
    imagen_url varchar(500),
    adjunto_url varchar(500),
    enlace_externo varchar(500),
    estado varchar(20) not null
);

create index if not exists idx_news_pub on news(estado, fecha_publicacion);

-- Empleos
create table if not exists job_offers (
    id uuid primary key,
    titulo varchar(200) not null,
    empresa varchar(200) not null,
    sector varchar(120),
    fecha_cierre date,
    tipo_contrato varchar(60),
    enlace_postulacion varchar(500),
    resumen varchar(1000),
    estado varchar(20) not null
);
create index if not exists idx_jobs_pub on job_offers(estado, fecha_cierre);

-- Eventos
create table if not exists events (
    id uuid primary key,
    titulo varchar(200) not null,
    fecha_hora timestamptz,
    lugar varchar(300),
    enlace_virtual varchar(500),
    descripcion text,
    cupos int,
    cancelacion_horas int,
    estado varchar(20) not null
);
create index if not exists idx_events_pub on events(estado, fecha_hora);

-- RSVP con constraint único (RN-VT02)
create table if not exists event_rsvp (
    id uuid primary key,
    event_id uuid not null references events(id) on delete cascade,
    graduate_id uuid not null references graduates(id) on delete cascade,
    created_at timestamptz not null,
    constraint ux_event_rsvp unique (event_id, graduate_id)
);

-- Auditoría
create table if not exists audit_logs (
    id bigserial primary key,
    actor varchar(120),
    action varchar(60),
    entity varchar(60),
    entity_id varchar(120),
    summary varchar(1000),
    created_at timestamptz
);

-- Log de exportes de reportes
create table if not exists export_logs (
    id bigserial primary key,
    actor varchar(120),
    created_at timestamptz not null,
    filters varchar(1000),
    fields varchar(1000),
    count bigint,
    format varchar(20)
);
-- Perfil: logs de cambios y confirmaciones de email
create table if not exists profile_change_log (
    id bigserial primary key,
    graduate_id uuid not null references graduates(id) on delete cascade,
    created_at timestamptz not null,
    summary varchar(1000) not null
);
create index if not exists idx_profile_log_grad on profile_change_log(graduate_id, created_at desc);

create table if not exists email_confirmations (
    id bigserial primary key,
    graduate_id uuid not null references graduates(id) on delete cascade,
    new_email varchar(200) not null,
    token varchar(120) not null,
    created_at timestamptz not null,
    confirmed_at timestamptz
);
create index if not exists idx_email_conf_token on email_confirmations(token);
