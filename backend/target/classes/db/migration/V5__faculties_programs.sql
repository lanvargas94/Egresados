create table if not exists faculties (
    name varchar(150) primary key
);

create table if not exists programs_catalog (
    id serial primary key,
    faculty_name varchar(150) not null references faculties(name) on delete cascade,
    name varchar(150) not null
);
create index if not exists idx_programs_fac on programs_catalog(faculty_name);

insert into faculties(name) values ('Ingeniería'),('Ciencias Sociales') on conflict (name) do nothing;
insert into programs_catalog(faculty_name,name) values
 ('Ingeniería','Ingeniería de Sistemas'),
 ('Ingeniería','Ingeniería Industrial'),
 ('Ciencias Sociales','Derecho'),
 ('Ciencias Sociales','Administración de Empresas')
on conflict do nothing;

