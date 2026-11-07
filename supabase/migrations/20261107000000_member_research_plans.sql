create table if not exists public.member_research_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  focus_area text not null check (focus_area in ('agriculture', 'energy', 'precious-metals', 'digital-assets')),
  learning_goal text not null check (learning_goal in ('ownership', 'operations', 'valuation', 'custody', 'liquidity')),
  status text not null default 'active' check (status in ('active', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists member_research_plans_user_created_idx
  on public.member_research_plans (user_id, created_at desc);

alter table public.member_research_plans enable row level security;

create policy "Members can read their own research plans"
  on public.member_research_plans for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Members can create their own research plans"
  on public.member_research_plans for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Members can update their own research plans"
  on public.member_research_plans for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Members can delete their own research plans"
  on public.member_research_plans for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.member_research_plans to authenticated;
revoke all on public.member_research_plans from anon;
