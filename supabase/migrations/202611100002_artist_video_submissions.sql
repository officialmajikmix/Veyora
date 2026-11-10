-- Artist video submissions are private until a Majik Mix administrator approves them.
create table if not exists public.artist_videos (
  id uuid primary key default gen_random_uuid(),
  artist_user_id uuid not null references auth.users(id) on delete cascade,
  artist text not null check (char_length(artist) between 1 and 120),
  song_title text not null check (char_length(song_title) between 1 and 160),
  caption text not null default '' check (char_length(caption) <= 500),
  audio_origin text not null check (audio_origin in ('catalogue', 'original')),
  streaming_url text,
  submission_path text not null unique,
  public_storage_path text unique,
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  created_at timestamptz not null default now(),
  check ((audio_origin = 'catalogue' and streaming_url ~ '^https://') or (audio_origin = 'original' and streaming_url is null))
);

alter table public.artist_videos enable row level security;
drop policy if exists "Public can view approved artist videos" on public.artist_videos;
create policy "Public can view approved artist videos" on public.artist_videos for select using (status = 'published' and public_storage_path is not null);
drop policy if exists "Artists can view their submissions" on public.artist_videos;
create policy "Artists can view their submissions" on public.artist_videos for select to authenticated using (artist_user_id = auth.uid());
drop policy if exists "Majik Mix admins can view all artist videos" on public.artist_videos;
create policy "Majik Mix admins can view all artist videos" on public.artist_videos for select to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'administrator'));
drop policy if exists "Artists can submit their own videos" on public.artist_videos;
create policy "Artists can submit their own videos" on public.artist_videos for insert to authenticated with check (artist_user_id = auth.uid() and status = 'pending' and public_storage_path is null);
drop policy if exists "Majik Mix admins review artist videos" on public.artist_videos;
create policy "Majik Mix admins review artist videos" on public.artist_videos for update to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'administrator')) with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'administrator'));
drop policy if exists "Artists can remove pending videos" on public.artist_videos;
create policy "Artists can remove pending videos" on public.artist_videos for delete to authenticated using (artist_user_id = auth.uid() and status = 'pending');
drop policy if exists "Majik Mix admins can remove artist videos" on public.artist_videos;
create policy "Majik Mix admins can remove artist videos" on public.artist_videos for delete to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'administrator'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('majikmix-video-submissions', 'majikmix-video-submissions', false, 104857600, array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update set public = false, file_size_limit = 104857600, allowed_mime_types = excluded.allowed_mime_types;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('majikmix-videos', 'majikmix-videos', true, 104857600, array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update set public = true, file_size_limit = 104857600, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Artists upload to their own private video folder" on storage.objects;
create policy "Artists upload to their own private video folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'majikmix-video-submissions' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Artists and admins can view private video submissions" on storage.objects;
create policy "Artists and admins can view private video submissions" on storage.objects for select to authenticated
  using (bucket_id = 'majikmix-video-submissions' and ((storage.foldername(name))[1] = auth.uid()::text or (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'administrator')));
drop policy if exists "Artists and admins can remove private video submissions" on storage.objects;
create policy "Artists and admins can remove private video submissions" on storage.objects for delete to authenticated
  using (bucket_id = 'majikmix-video-submissions' and ((storage.foldername(name))[1] = auth.uid()::text or (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'administrator')));

drop policy if exists "Public can play approved artist videos" on storage.objects;
create policy "Public can play approved artist videos" on storage.objects for select using (bucket_id = 'majikmix-videos');
drop policy if exists "Majik Mix admins publish approved artist videos" on storage.objects;
create policy "Majik Mix admins publish approved artist videos" on storage.objects for insert to authenticated
  with check (bucket_id = 'majikmix-videos' and (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'administrator'));
drop policy if exists "Majik Mix admins remove published artist videos" on storage.objects;
create policy "Majik Mix admins remove published artist videos" on storage.objects for delete to authenticated
  using (bucket_id = 'majikmix-videos' and (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'administrator'));
