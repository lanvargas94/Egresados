-- Tabla para registrar interés de egresados en ofertas de empleo
create table if not exists job_interests (
    id uuid primary key default gen_random_uuid(),
    job_offer_id uuid not null references job_offers(id) on delete cascade,
    graduate_id uuid not null references graduates(id) on delete cascade,
    created_at timestamptz not null default now(),
    unique(job_offer_id, graduate_id)
);

create index if not exists idx_job_interests_job on job_interests(job_offer_id);
create index if not exists idx_job_interests_graduate on job_interests(graduate_id);




