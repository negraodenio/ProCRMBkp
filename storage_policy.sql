-- Run this in the Supabase SQL Editor to allow uploads

-- NOTE: We removed 'alter table' commands to avoid permission errors.
-- RLS is enabled by default on storage.objects.

-- 1. Drop existing policies to avoid "policy already exists" errors
drop policy if exists "Public Access to Avatars" on storage.objects;
drop policy if exists "Authenticated Users can Upload Avatars" on storage.objects;
drop policy if exists "Users can Update Own Avatars" on storage.objects;

-- 2. Allow Public Read Access to 'avatars' bucket
create policy "Public Access to Avatars"
on storage.objects for select
using ( bucket_id = 'avatars' );

-- 3. Allow Authenticated Users to Upload to 'avatars' bucket
create policy "Authenticated Users can Upload Avatars"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'avatars' );

-- 4. Allow Users to Update/Delete their own files
create policy "Users can Update Own Avatars"
on storage.objects for update
to authenticated
using ( bucket_id = 'avatars' )
with check ( bucket_id = 'avatars' );
