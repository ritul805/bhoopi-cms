create table if not exists public.story_cards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  thumbnail_url text,
  hero_banner_url text,
  category text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.story_cards
  add column if not exists thumbnail_url text,
  add column if not exists hero_banner_url text,
  add column if not exists category text,
  add column if not exists sort_order integer default 0,
  add column if not exists is_active boolean default true,
  add column if not exists created_at timestamptz default now();

alter table public.stories
  add column if not exists story_card_id uuid references public.story_cards(id) on delete cascade,
  add column if not exists sort_order integer default 0;

alter table public.episodes
  add column if not exists duration_seconds integer default 0;

create index if not exists story_cards_sort_order_idx
  on public.story_cards(sort_order, created_at);

create index if not exists stories_story_card_id_sort_order_idx
  on public.stories(story_card_id, sort_order, created_at);

create index if not exists episodes_story_id_episode_number_idx
  on public.episodes(story_id, episode_number);
