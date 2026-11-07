create table if not exists public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 254),
  type text not null check (type in ('feature', 'bug', 'contact')),
  message text not null check (char_length(message) between 1 and 5000)
);

alter table public.feedback_submissions enable row level security;

revoke all on table public.feedback_submissions from anon, authenticated;
grant insert on table public.feedback_submissions to service_role;

create table if not exists public.website_analytics_daily (
  metric_date date not null,
  event_name text not null check (event_name in ('page_view', 'download_click')),
  product_name text not null check (product_name in ('none', 'arlo_os', 'arlo_deck')),
  event_count bigint not null default 0 check (event_count >= 0),
  primary key (metric_date, event_name, product_name),
  check (
    (event_name = 'page_view' and product_name = 'none')
    or (event_name = 'download_click' and product_name in ('arlo_os', 'arlo_deck'))
  )
);

alter table public.website_analytics_daily enable row level security;
revoke all on table public.website_analytics_daily from anon, authenticated;

create or replace function public.increment_website_analytics(
  p_event_name text,
  p_product_name text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (
    (p_event_name = 'page_view' and p_product_name = 'none')
    or (p_event_name = 'download_click' and p_product_name in ('arlo_os', 'arlo_deck'))
  ) then
    raise exception 'Unsupported website analytics event';
  end if;

  insert into public.website_analytics_daily (
    metric_date,
    event_name,
    product_name,
    event_count
  )
  values (
    (pg_catalog.timezone('utc', pg_catalog.now()))::date,
    p_event_name,
    p_product_name,
    1
  )
  on conflict (metric_date, event_name, product_name)
  do update set event_count =
    public.website_analytics_daily.event_count + 1;
end;
$$;

create or replace function public.get_website_analytics_totals()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select pg_catalog.jsonb_build_object(
    'pageViews',
    coalesce(pg_catalog.sum(event_count) filter (where event_name = 'page_view'), 0),
    'arloOsDownloadClicks',
    coalesce(
      pg_catalog.sum(event_count) filter (
        where event_name = 'download_click' and product_name = 'arlo_os'
      ),
      0
    ),
    'arloDeckDownloadClicks',
    coalesce(
      pg_catalog.sum(event_count) filter (
        where event_name = 'download_click' and product_name = 'arlo_deck'
      ),
      0
    )
  )
  from public.website_analytics_daily;
$$;

revoke all on function public.increment_website_analytics(text, text) from public, anon, authenticated;
grant execute on function public.increment_website_analytics(text, text) to service_role;

revoke all on function public.get_website_analytics_totals() from public, anon, authenticated;
grant execute on function public.get_website_analytics_totals() to service_role;
