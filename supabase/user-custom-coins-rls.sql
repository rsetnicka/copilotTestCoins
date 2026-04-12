-- Optional: run in SQL Editor only if you enable RLS on public.user_custom_coins.
-- The app reads/writes this table via the Supabase client (user session), not Drizzle.
-- If RLS is enabled without policies, inserts return: new row violates row-level security policy

alter table public.user_custom_coins enable row level security;

drop policy if exists "user_custom_coins_select_own" on public.user_custom_coins;
drop policy if exists "user_custom_coins_insert_own" on public.user_custom_coins;
drop policy if exists "user_custom_coins_update_own" on public.user_custom_coins;
drop policy if exists "user_custom_coins_delete_own" on public.user_custom_coins;

create policy "user_custom_coins_select_own"
on public.user_custom_coins for select to authenticated
using ((select auth.uid()::text) = user_id);

create policy "user_custom_coins_insert_own"
on public.user_custom_coins for insert to authenticated
with check ((select auth.uid()::text) = user_id);

create policy "user_custom_coins_update_own"
on public.user_custom_coins for update to authenticated
using ((select auth.uid()::text) = user_id)
with check ((select auth.uid()::text) = user_id);

create policy "user_custom_coins_delete_own"
on public.user_custom_coins for delete to authenticated
using ((select auth.uid()::text) = user_id);
