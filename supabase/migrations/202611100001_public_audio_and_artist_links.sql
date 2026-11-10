-- Majik Mix public audio library and artist streaming links.
-- Run in the Supabase SQL editor after deploying the matching application code.

create table if not exists public.media_audio (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  artist text not null check (char_length(artist) between 1 and 120),
  description text not null default '' check (char_length(description) <= 500),
  copyright_notice text not null check (char_length(copyright_notice) between 1 and 240),
  storage_path text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.artist_links (
  id uuid primary key default gen_random_uuid(),
  artist text not null check (char_length(artist) between 1 and 120),
  platform text not null check (char_length(platform) between 1 and 60),
  url text not null check (url ~ '^https://'),
  created_at timestamptz not null default now()
);

alter table public.media_audio enable row level security;
alter table public.artist_links enable row level security;

drop policy if exists "Public can view audio catalogue" on public.media_audio;
create policy "Public can view audio catalogue" on public.media_audio for select using (true);
drop policy if exists "Majik Mix admins manage audio catalogue" on public.media_audio;
create policy "Majik Mix admins manage audio catalogue" on public.media_audio
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'administrator'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'administrator'));

drop policy if exists "Public can view artist links" on public.artist_links;
create policy "Public can view artist links" on public.artist_links for select using (true);
drop policy if exists "Majik Mix admins manage artist links" on public.artist_links;
create policy "Majik Mix admins manage artist links" on public.artist_links
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'administrator'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'administrator'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('majikmix-audio', 'majikmix-audio', true, 52428800, array['audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/wav', 'audio/x-wav', 'audio/flac', 'audio/ogg'])
on conflict (id) do update set public = true, file_size_limit = 52428800,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can download Majik Mix audio" on storage.objects;
create policy "Public can download Majik Mix audio" on storage.objects for select using (bucket_id = 'majikmix-audio');
drop policy if exists "Majik Mix admins upload audio" on storage.objects;
create policy "Majik Mix admins upload audio" on storage.objects for insert
  with check (bucket_id = 'majikmix-audio' and (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'administrator'));
drop policy if exists "Majik Mix admins update audio" on storage.objects;
create policy "Majik Mix admins update audio" on storage.objects for update
  using (bucket_id = 'majikmix-audio' and (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'administrator'))
  with check (bucket_id = 'majikmix-audio' and (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'administrator'));
drop policy if exists "Majik Mix admins delete audio" on storage.objects;
create policy "Majik Mix admins delete audio" on storage.objects for delete
  using (bucket_id = 'majikmix-audio' and (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'administrator'));
