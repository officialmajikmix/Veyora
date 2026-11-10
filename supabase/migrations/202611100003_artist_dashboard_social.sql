alter table public.artist_videos
  add column if not exists visibility text not null default 'public'
  check (visibility in ('public', 'private'));

drop policy if exists "Public can view approved artist videos" on public.artist_videos;
create policy "Public can view approved artist videos" on public.artist_videos
  for select using (status = 'published' and visibility = 'public' and public_storage_path is not null);
drop policy if exists "Artists can update their video visibility" on public.artist_videos;
create policy "Artists can update their video visibility" on public.artist_videos
  for update to authenticated using (artist_user_id = auth.uid()) with check (artist_user_id = auth.uid());
drop policy if exists "Artists can remove pending videos" on public.artist_videos;
drop policy if exists "Artists can remove their videos" on public.artist_videos;
create policy "Artists can remove their videos" on public.artist_videos
  for delete to authenticated using (artist_user_id = auth.uid());

create or replace function public.guard_artist_video_owner_update()
returns trigger language plpgsql set search_path = '' as $$
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') not in ('admin', 'administrator') then
    if old.artist_user_id <> auth.uid()
      or new.artist_user_id is distinct from old.artist_user_id
      or new.artist is distinct from old.artist
      or new.song_title is distinct from old.song_title
      or new.caption is distinct from old.caption
      or new.audio_origin is distinct from old.audio_origin
      or new.streaming_url is distinct from old.streaming_url
      or new.submission_path is distinct from old.submission_path
      or new.public_storage_path is distinct from old.public_storage_path
      or new.status is distinct from old.status
      or new.created_at is distinct from old.created_at then
      raise exception 'Artists may only change the privacy of their videos';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists guard_artist_video_owner_update on public.artist_videos;
create trigger guard_artist_video_owner_update before update on public.artist_videos
  for each row execute function public.guard_artist_video_owner_update();

create table if not exists public.artist_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Artist' check (char_length(display_name) between 1 and 80),
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.artist_profiles enable row level security;
drop policy if exists "Public can view artist profiles" on public.artist_profiles;
create policy "Public can view artist profiles" on public.artist_profiles for select using (true);
drop policy if exists "Artists manage their profile" on public.artist_profiles;
create policy "Artists manage their profile" on public.artist_profiles for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.video_comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.artist_videos(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1200),
  created_at timestamptz not null default now()
);
create index if not exists video_comments_video_created_idx on public.video_comments(video_id, created_at desc);
alter table public.video_comments enable row level security;
drop policy if exists "Public can view comments on public videos" on public.video_comments;
create policy "Public can view comments on public videos" on public.video_comments for select using (
  exists (select 1 from public.artist_videos v where v.id = video_id and v.status = 'published' and v.visibility = 'public')
);
drop policy if exists "Signed-in artists can comment on public videos" on public.video_comments;
create policy "Signed-in artists can comment on public videos" on public.video_comments for insert to authenticated with check (
  author_user_id = auth.uid() and exists (select 1 from public.artist_videos v where v.id = video_id and v.status = 'published' and v.visibility = 'public')
);
drop policy if exists "Authors and admins can delete comments" on public.video_comments;
create policy "Authors and admins can delete comments" on public.video_comments for delete to authenticated using (
  author_user_id = auth.uid() or (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'administrator')
);

create table if not exists public.video_reactions (
  video_id uuid not null references public.artist_videos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null check (reaction in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  primary key (video_id, user_id)
);
alter table public.video_reactions enable row level security;
drop policy if exists "Artists view own video reactions" on public.video_reactions;
create policy "Artists view own video reactions" on public.video_reactions for select to authenticated using (user_id = auth.uid());
drop policy if exists "Artists add own video reactions" on public.video_reactions;
create policy "Artists add own video reactions" on public.video_reactions for insert to authenticated with check (
  user_id = auth.uid() and exists (select 1 from public.artist_videos v where v.id = video_id and v.status = 'published' and v.visibility = 'public')
);
drop policy if exists "Artists change own video reactions" on public.video_reactions;
create policy "Artists change own video reactions" on public.video_reactions for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Artists remove own video reactions" on public.video_reactions;
create policy "Artists remove own video reactions" on public.video_reactions for delete to authenticated using (user_id = auth.uid());

create or replace function public.get_video_reaction_counts(p_video_id uuid)
returns table(likes bigint, dislikes bigint)
language sql stable security definer set search_path = '' as $$
  select count(*) filter (where r.reaction = 'like'), count(*) filter (where r.reaction = 'dislike')
  from public.video_reactions r
  where r.video_id = p_video_id and exists (
    select 1 from public.artist_videos v where v.id = p_video_id and v.status = 'published' and v.visibility = 'public'
  );
$$;
revoke all on function public.get_video_reaction_counts(uuid) from public;
grant execute on function public.get_video_reaction_counts(uuid) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('artist-avatars', 'artist-avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;
update storage.buckets set public = false where id = 'majikmix-videos';
drop policy if exists "Public can play approved artist videos" on storage.objects;
create policy "Public can play approved artist videos" on storage.objects for select using (
  bucket_id = 'majikmix-videos' and exists (
    select 1 from public.artist_videos v where v.public_storage_path = name and v.status = 'published' and v.visibility = 'public'
  )
);
drop policy if exists "Artists can view their published videos" on storage.objects;
create policy "Artists can view their published videos" on storage.objects for select to authenticated using (
  bucket_id = 'majikmix-videos' and exists (
    select 1 from public.artist_videos v where v.artist_user_id = auth.uid() and v.public_storage_path = name
  )
);
drop policy if exists "Public can view artist avatars" on storage.objects;
create policy "Public can view artist avatars" on storage.objects for select using (bucket_id = 'artist-avatars');
drop policy if exists "Artists upload their own avatar" on storage.objects;
create policy "Artists upload their own avatar" on storage.objects for insert to authenticated
  with check (bucket_id = 'artist-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Artists replace their own avatar" on storage.objects;
create policy "Artists replace their own avatar" on storage.objects for update to authenticated
  using (bucket_id = 'artist-avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'artist-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Artists remove their own avatar" on storage.objects;
create policy "Artists remove their own avatar" on storage.objects for delete to authenticated
  using (bucket_id = 'artist-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Artists remove own published videos" on storage.objects;
create policy "Artists remove own published videos" on storage.objects for delete to authenticated using (
  bucket_id = 'majikmix-videos' and exists (
    select 1 from public.artist_videos v where v.artist_user_id = auth.uid() and v.public_storage_path = name
  )
);

grant select on public.artist_profiles to anon, authenticated;
grant insert, update, delete on public.artist_profiles to authenticated;
grant select, insert, delete on public.video_comments to anon, authenticated;
grant select, insert, update, delete on public.video_reactions to authenticated;
