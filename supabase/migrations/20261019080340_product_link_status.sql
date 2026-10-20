-- Additive link-health columns. Null means not checked yet, so existing
-- rows stay eligible for match_products until the checker has seen them.
alter table public.products
  add column if not exists link_status text,
  add column if not exists link_http_status integer,
  add column if not exists link_checked_at timestamptz;

alter table public.products
  drop constraint if exists products_link_status_check;

alter table public.products
  add constraint products_link_status_check
  check (link_status is null or link_status in ('ok', 'dead', 'soft_404', 'error'));

comment on column public.products.link_status is
  'Affiliate link health: null unchecked, ok, dead (HTTP 404/410), soft_404 (200 page that says the product is gone), error (transient).';

create index if not exists products_link_checked_at_idx
  on public.products (link_checked_at nulls first);

-- Same signature as before. Dead and soft-404 rows are no longer returned,
-- so chat cannot attach their affiliate URL.
create or replace function public.match_products(
  query_embedding vector,
  match_category text default null,
  match_retailer text default null,
  match_count integer default 6
)
returns table (
  id uuid,
  retailer text,
  brand text,
  name text,
  category text,
  price_cents integer,
  currency text,
  product_url text,
  image_url text,
  similarity double precision
)
language sql
stable
as $$
  select id, retailer, brand, name, category, price_cents, currency, product_url, image_url,
         1 - (embedding <=> query_embedding) as similarity
  from public.products
  where embedding is not null
    and coalesce(link_status, '') not in ('dead', 'soft_404')
    and (match_category is null or category = match_category)
    and (match_retailer is null or retailer = match_retailer)
  order by embedding <=> query_embedding
  limit match_count;
$$;
