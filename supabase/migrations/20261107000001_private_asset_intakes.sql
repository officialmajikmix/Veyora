-- Internal candidate-asset intake. Records are never exposed as public offerings.
create table if not exists public.private_asset_intakes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  asset_class text not null check (asset_class in ('agriculture', 'energy', 'precious-metals')),
  asset_name text not null check (char_length(asset_name) between 1 and 160),
  country_region text not null default '',
  operator_name text not null default '',
  rights_evidence text not null default '',
  permits_evidence text not null default '',
  operations_evidence text not null default '',
  source_url text not null default '',
  open_questions text not null default '',
  review_status text not null default 'draft'
    check (review_status in ('draft', 'under-review', 'hold', 'closed'))
);

create index if not exists private_asset_intakes_status_updated_idx
  on public.private_asset_intakes (review_status, updated_at desc);

alter table public.private_asset_intakes enable row level security;
revoke all on public.private_asset_intakes from public, anon;
grant select, insert, update, delete on public.private_asset_intakes to authenticated;

create policy "Veyora admins can read private asset intakes"
  on public.private_asset_intakes for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'veyora_admin');

create policy "Veyora admins can add private asset intakes"
  on public.private_asset_intakes for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'veyora_admin');

create policy "Veyora admins can update private asset intakes"
  on public.private_asset_intakes for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'veyora_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'veyora_admin');

create policy "Veyora admins can remove private asset intakes"
  on public.private_asset_intakes for delete to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'veyora_admin');
