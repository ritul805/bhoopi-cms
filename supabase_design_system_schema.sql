create table if not exists public.design_tokens (
  id uuid primary key default gen_random_uuid(),
  token_key text not null unique,
  token_value text not null,
  token_type text not null default 'color',
  group_name text default 'general',
  description text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists design_tokens_group_sort_idx
  on public.design_tokens(group_name, sort_order, token_key);

alter table public.design_tokens enable row level security;

drop policy if exists "Design tokens are publicly readable" on public.design_tokens;
create policy "Design tokens are publicly readable"
  on public.design_tokens
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Authenticated users can manage design tokens" on public.design_tokens;
create policy "Authenticated users can manage design tokens"
  on public.design_tokens
  for all
  to authenticated
  using (true)
  with check (true);

grant select on public.design_tokens to anon, authenticated;
grant insert, update, delete on public.design_tokens to authenticated;

insert into public.design_tokens
  (token_key, token_value, token_type, group_name, description, sort_order, is_active)
values
  ('home.background.top', '#24325f', 'color', 'home', 'Top color for the home background gradient.', 1, true),
  ('home.background.middle', '#324582', 'color', 'home', 'Middle color for the home background gradient.', 2, true),
  ('home.background.bottom', '#17234f', 'color', 'home', 'Bottom color for the home background gradient.', 3, true),
  ('home.card.text.primary', '#ffffff', 'color', 'home', 'Primary text color on story cards.', 4, true),
  ('player.background.primary', '#58aaf0', 'color', 'player', 'Primary color for story/player screens.', 1, true)
on conflict (token_key) do nothing;
