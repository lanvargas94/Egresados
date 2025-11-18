create table if not exists contract_types (
    id serial primary key,
    name varchar(100) unique not null,
    active boolean not null default true
);

insert into contract_types(name, active) values
 ('Fijo', true),
 ('Indefinido', true),
 ('Prácticas', true),
 ('Temporal', true),
 ('Honorarios', true),
 ('Freelance', true),
 ('Otro', true)
on conflict (name) do nothing;

