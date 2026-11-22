-- 0008 storage buckets and object policies. Skipped where the storage schema does not exist (PGlite tests).

do $migration$
begin
  if not exists (select 1 from pg_namespace where nspname = 'storage') then
    raise notice 'storage schema not found; skipping bucket setup';
    return;
  end if;

  insert into storage.buckets (id, name, public) values
    ('curriculum-sources', 'curriculum-sources', false),
    ('lesson-assets', 'lesson-assets', true)
  on conflict (id) do update set public = excluded.public;

  execute $p$
    create policy "curriculum-sources admin all" on storage.objects for all to authenticated
      using (bucket_id = 'curriculum-sources' and lugu.is_admin())
      with check (bucket_id = 'curriculum-sources' and lugu.is_admin())
  $p$;
  execute $p$
    create policy "lesson-assets public read" on storage.objects for select to anon, authenticated
      using (bucket_id = 'lesson-assets')
  $p$;
  execute $p$
    create policy "lesson-assets admin insert" on storage.objects for insert to authenticated
      with check (bucket_id = 'lesson-assets' and lugu.is_admin())
  $p$;
  execute $p$
    create policy "lesson-assets admin update" on storage.objects for update to authenticated
      using (bucket_id = 'lesson-assets' and lugu.is_admin())
      with check (bucket_id = 'lesson-assets' and lugu.is_admin())
  $p$;
  execute $p$
    create policy "lesson-assets admin delete" on storage.objects for delete to authenticated
      using (bucket_id = 'lesson-assets' and lugu.is_admin())
  $p$;
end
$migration$;
