-- Run once in Supabase SQL Editor (Dashboard → SQL).
-- Bucket + policies for personal coin images under {userId}/{uuid}.webp
-- (browser upload with the publishable key + user session).
--
-- Upserts need SELECT + UPDATE on the same object, not only INSERT.

insert into storage.buckets (id, name, public, file_size_limit)
values ('custom-coins', 'custom-coins', true, 5242880)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

drop policy if exists "custom_coins_select_own" on storage.objects;
drop policy if exists "custom_coins_insert_own" on storage.objects;
drop policy if exists "custom_coins_update_own" on storage.objects;
drop policy if exists "custom_coins_delete_own" on storage.objects;

-- Path must start with "<uid>/" after trimming leading slashes (matches app upload path).
create policy "custom_coins_select_own"
on storage.objects for select to authenticated
using (
  bucket_id = 'custom-coins'
  and coalesce(nullif(auth.uid()::text, ''), nullif(auth.jwt() ->> 'sub', '')) is not null
  and position(
    (coalesce(nullif(auth.uid()::text, ''), nullif(auth.jwt() ->> 'sub', '')) || '/')
    in ltrim(name, '/')
  ) = 1
);

create policy "custom_coins_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'custom-coins'
  and coalesce(nullif(auth.uid()::text, ''), nullif(auth.jwt() ->> 'sub', '')) is not null
  and position(
    (coalesce(nullif(auth.uid()::text, ''), nullif(auth.jwt() ->> 'sub', '')) || '/')
    in ltrim(name, '/')
  ) = 1
);

create policy "custom_coins_update_own"
on storage.objects for update to authenticated
using (
  bucket_id = 'custom-coins'
  and coalesce(nullif(auth.uid()::text, ''), nullif(auth.jwt() ->> 'sub', '')) is not null
  and position(
    (coalesce(nullif(auth.uid()::text, ''), nullif(auth.jwt() ->> 'sub', '')) || '/')
    in ltrim(name, '/')
  ) = 1
)
with check (
  bucket_id = 'custom-coins'
  and coalesce(nullif(auth.uid()::text, ''), nullif(auth.jwt() ->> 'sub', '')) is not null
  and position(
    (coalesce(nullif(auth.uid()::text, ''), nullif(auth.jwt() ->> 'sub', '')) || '/')
    in ltrim(name, '/')
  ) = 1
);

create policy "custom_coins_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'custom-coins'
  and coalesce(nullif(auth.uid()::text, ''), nullif(auth.jwt() ->> 'sub', '')) is not null
  and position(
    (coalesce(nullif(auth.uid()::text, ''), nullif(auth.jwt() ->> 'sub', '')) || '/')
    in ltrim(name, '/')
  ) = 1
);
