alter table news add column if not exists facultad varchar(150);
alter table news add column if not exists programa varchar(150);
create index if not exists idx_news_segment on news(facultad, programa);

