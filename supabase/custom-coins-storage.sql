-- Run once in Supabase SQL Editor (Dashboard → SQL).
-- Creates a public bucket for coin images and lets each signed-in user
-- upload/delete only under their own folder: {auth.uid()}/...

insert into storage.buckets (id, name, public, file_size_limit)
values ('custom-coins', 'custom-coins', true, 5242880)
on conflict (id) do update set public = excluded.public;

drop policy if exists "custom_coins_insert_own" on storage.objects;
drop policy if exists "custom_coins_update_own" on storage.objects;
drop policy if exists "custom_coins_delete_own" on storage.objects;

create policy "custom_coins_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'custom-coins'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "custom_coins_update_own"
on storage.objects for update to authenticated
using (
  bucket_id = 'custom-coins'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'custom-coins'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "custom_coins_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'custom-coins'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- Public bucket: objects are readable via /object/public/ URLs without a SELECT policy.
