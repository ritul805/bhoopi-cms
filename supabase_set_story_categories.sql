-- Atomically replace the set of categories linked to a story.
--
-- The client previously did this as two separate round trips: DELETE all links
-- for the story, then INSERT the new ones. Those are independent statements, so
-- a failure or dropped connection between them left the story with no
-- categories at all — worse than the edit not happening.
--
-- A function body runs inside a single implicit transaction, so the delete and
-- insert either both land or neither does.
--
-- SECURITY INVOKER (the default) is deliberate: the function runs with the
-- caller's permissions, so row level security on story_category_links still
-- applies. Do not switch this to SECURITY DEFINER without adding your own
-- authorization checks inside the body.

create or replace function public.set_story_categories(
  p_story_id uuid,
  p_category_ids uuid[]
)
returns void
language plpgsql
as $$
begin
  if p_story_id is null then
    raise exception 'story_id is required';
  end if;

  -- Fail loudly rather than silently creating links to a story that is gone.
  if not exists (select 1 from public.stories where id = p_story_id) then
    raise exception 'story % does not exist', p_story_id;
  end if;

  delete from public.story_category_links
   where story_id = p_story_id;

  -- coalesce so that passing null clears categories instead of erroring
  if array_length(coalesce(p_category_ids, '{}'), 1) > 0 then
    insert into public.story_category_links (story_id, category_id)
    select p_story_id, unnest(p_category_ids)
    on conflict do nothing;
  end if;
end;
$$;

comment on function public.set_story_categories(uuid, uuid[]) is
  'Replaces all category links for a story in a single transaction.';

-- Prevent duplicate links, which would otherwise accumulate if a caller
-- inserted the same pair twice. Also makes the ON CONFLICT above meaningful.
create unique index if not exists story_category_links_story_category_uniq
  on public.story_category_links (story_id, category_id);
