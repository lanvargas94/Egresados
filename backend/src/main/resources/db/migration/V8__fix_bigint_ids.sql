-- Align integer IDs with JPA Long mappings (Hibernate expects BIGINT)
alter table if exists cities alter column id type bigint;
alter table if exists sectors alter column id type bigint;
alter table if exists programs_catalog alter column id type bigint;
alter table if exists contract_types alter column id type bigint;
alter table if exists programs alter column id type bigint;

