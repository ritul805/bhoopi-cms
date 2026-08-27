create table if not exists public.design_tokens (
  id uuid primary key default gen_random_uuid(),
  token_key text not null,
  token_value text not null,
  token_type text not null default 'color',
  group_name text default 'general',
  theme text not null default 'light',
  description text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.design_tokens
  add column if not exists theme text not null default 'light';

do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'design_tokens'
      and constraint_name = 'design_tokens_token_key_key'
  ) then
    alter table public.design_tokens drop constraint design_tokens_token_key_key;
  end if;
end $$;

create unique index if not exists design_tokens_token_key_theme_key
  on public.design_tokens(token_key, theme);

drop index if exists design_tokens_group_sort_idx;
create index if not exists design_tokens_group_sort_idx
  on public.design_tokens(theme, group_name, sort_order, token_key);

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
  (token_key, token_value, token_type, group_name, theme, description, sort_order, is_active)
values
  ('color.primary', '#6750A4', 'color', 'boopi', 'light', 'Main Boopi action color.', 1, true),
  ('color.on-primary', '#FFFFFF', 'color', 'boopi', 'light', 'Text and icons on primary.', 2, true),
  ('color.primary-container', '#EADDFF', 'color', 'boopi', 'light', 'Primary container backgrounds.', 3, true),
  ('color.on-primary-container', '#21005D', 'color', 'boopi', 'light', 'Text on primary containers.', 4, true),
  ('color.secondary', '#625B71', 'color', 'boopi', 'light', 'Secondary actions and accents.', 5, true),
  ('color.on-secondary', '#FFFFFF', 'color', 'boopi', 'light', 'Text and icons on secondary.', 6, true),
  ('color.secondary-container', '#E8DEF8', 'color', 'boopi', 'light', 'Secondary container backgrounds.', 7, true),
  ('color.on-secondary-container', '#1D192B', 'color', 'boopi', 'light', 'Text on secondary containers.', 8, true),
  ('color.surface', '#FFFBFE', 'color', 'boopi', 'light', 'App and card surfaces.', 9, true),
  ('color.on-surface', '#1C1B1F', 'color', 'boopi', 'light', 'Primary text on surfaces.', 10, true),
  ('color.surface-variant', '#E7E0EC', 'color', 'boopi', 'light', 'Muted surface backgrounds.', 11, true),
  ('color.on-surface-variant', '#49454F', 'color', 'boopi', 'light', 'Muted text on surfaces.', 12, true),
  ('color.outline', '#79747E', 'color', 'boopi', 'light', 'Borders and separators.', 13, true),
  ('color.error', '#B3261E', 'color', 'boopi', 'light', 'Destructive and error states.', 14, true),
  ('home.background.top', '#24325F', 'color', 'boopi', 'light', 'Top of Boopi home gradient.', 15, true),
  ('home.background.middle', '#324582', 'color', 'boopi', 'light', 'Middle of Boopi home gradient.', 16, true),
  ('home.background.bottom', '#17234F', 'color', 'boopi', 'light', 'Bottom of Boopi home gradient.', 17, true),
  ('player.background.primary', '#58AAF0', 'color', 'boopi', 'light', 'Story player screen color.', 18, true),
  ('home.card.text.primary', '#FFFFFF', 'color', 'boopi', 'light', 'Text over story cards.', 19, true),
  ('color.primary', '#D0BCFF', 'color', 'boopi', 'dark', 'Main Boopi action color in dark theme.', 1, true),
  ('color.on-primary', '#381E72', 'color', 'boopi', 'dark', 'Text and icons on dark primary.', 2, true),
  ('color.primary-container', '#4F378B', 'color', 'boopi', 'dark', 'Dark primary container backgrounds.', 3, true),
  ('color.on-primary-container', '#EADDFF', 'color', 'boopi', 'dark', 'Text on dark primary containers.', 4, true),
  ('color.secondary', '#CCC2DC', 'color', 'boopi', 'dark', 'Secondary dark actions and accents.', 5, true),
  ('color.on-secondary', '#332D41', 'color', 'boopi', 'dark', 'Text and icons on dark secondary.', 6, true),
  ('color.secondary-container', '#4A4458', 'color', 'boopi', 'dark', 'Dark secondary container backgrounds.', 7, true),
  ('color.on-secondary-container', '#E8DEF8', 'color', 'boopi', 'dark', 'Text on dark secondary containers.', 8, true),
  ('color.surface', '#141218', 'color', 'boopi', 'dark', 'Dark app and card surfaces.', 9, true),
  ('color.on-surface', '#E6E0E9', 'color', 'boopi', 'dark', 'Primary text on dark surfaces.', 10, true),
  ('color.surface-variant', '#49454F', 'color', 'boopi', 'dark', 'Muted dark surface backgrounds.', 11, true),
  ('color.on-surface-variant', '#CAC4D0', 'color', 'boopi', 'dark', 'Muted text on dark surfaces.', 12, true),
  ('color.outline', '#938F99', 'color', 'boopi', 'dark', 'Dark borders and separators.', 13, true),
  ('color.error', '#F2B8B5', 'color', 'boopi', 'dark', 'Dark destructive and error states.', 14, true),
  ('home.background.top', '#111827', 'color', 'boopi', 'dark', 'Top of Boopi dark home gradient.', 15, true),
  ('home.background.middle', '#1F2A44', 'color', 'boopi', 'dark', 'Middle of Boopi dark home gradient.', 16, true),
  ('home.background.bottom', '#080D1F', 'color', 'boopi', 'dark', 'Bottom of Boopi dark home gradient.', 17, true),
  ('player.background.primary', '#2F80ED', 'color', 'boopi', 'dark', 'Dark story player screen color.', 18, true),
  ('home.card.text.primary', '#FFFFFF', 'color', 'boopi', 'dark', 'Text over dark story cards.', 19, true)
on conflict (token_key, theme) do nothing;
