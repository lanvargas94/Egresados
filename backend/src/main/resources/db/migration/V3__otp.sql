create table if not exists graduate_otp (
    id bigserial primary key,
    graduate_id uuid not null references graduates(id) on delete cascade,
    code varchar(10) not null,
    expires_at timestamptz not null,
    attempts int not null default 0,
    created_at timestamptz not null,
    consumed_at timestamptz
);
create index if not exists idx_grad_otp_grad on graduate_otp(graduate_id, created_at desc);

-- Waitlist eventos (v1.1)
create table if not exists event_waitlist (
    id bigserial primary key,
    event_id uuid not null references events(id) on delete cascade,
    graduate_id uuid not null references graduates(id) on delete cascade,
    created_at timestamptz not null,
    notified_at timestamptz,
    constraint ux_event_waitlist unique (event_id, graduate_id)
);
create index if not exists idx_waitlist_event on event_waitlist(event_id, created_at);
