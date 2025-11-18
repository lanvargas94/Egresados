-- Catálogos País/Ciudad/Sectores
create table if not exists countries (
    code varchar(2) primary key,
    name varchar(120) not null
);

create table if not exists cities (
    id serial primary key,
    country_code varchar(2) not null references countries(code) on delete cascade,
    name varchar(150) not null
);
create index if not exists idx_cities_country on cities(country_code);

create table if not exists sectors (
    id serial primary key,
    name varchar(150) unique not null,
    active boolean not null default true
);

-- Semillas mínimas
insert into countries(code,name) values ('CO','Colombia') on conflict (code) do nothing;
insert into cities(country_code,name) values ('CO','Neiva'),('CO','Bogotá'),('CO','Medellín') on conflict do nothing;
insert into sectors(name,active) values ('Tecnología', true), ('Salud', true), ('Educación', true) on conflict do nothing;

-- Unicidad de correo personal (cuando no es null)
create unique index if not exists ux_graduates_correo_personal on graduates (correo_personal) where correo_personal is not null;

