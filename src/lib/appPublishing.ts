type SupabaseClientLike = {
  from: (table: string) => SupabaseQueryLike;
};

type SupabaseQueryLike = {
  select: (columns?: string, options?: unknown) => SupabaseQueryLike;
  order: (column: string, options?: unknown) => SupabaseQueryLike;
  eq: (column: string, value: unknown) => SupabaseQueryLike;
  limit: (count: number) => SupabaseQueryLike;
  insert: (values: unknown) => Promise<SupabaseResultLike>;
  update: (values: unknown) => SupabaseQueryLike;
  single: () => Promise<SupabaseResultLike>;
  maybeSingle: () => Promise<SupabaseResultLike>;
  then: Promise<SupabaseResultLike>["then"];
};

type SupabaseResultLike = {
  data?: unknown;
  error?: { message?: string } | null;
};

type EpisodeLike = {
  id?: string;
  story_id: string;
  episode_number: number;
  hindi_script?: string | null;
  image_url?: string | null;
  audio_url?: string | null;
};

export async function publishStoryToAppSections(
  supabase: SupabaseClientLike,
  storyId: string
) {
  const { data: sections, error: sectionsError } = await supabase
    .from("story_sections")
    .select("id")
    .order("display_order", { ascending: true });

  const appSections = (sections ?? []) as Array<{ id: string }>;

  if (sectionsError || !appSections.length) {
    return { error: sectionsError ?? null };
  }

  for (const section of appSections) {
    const { data: existingLink } = await supabase
      .from("section_stories")
      .select("section_id")
      .eq("section_id", section.id)
      .eq("story_id", storyId)
      .maybeSingle();

    if (existingLink) continue;

    const { data: lastStory } = await supabase
      .from("section_stories")
      .select("sort_order")
      .eq("section_id", section.id)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const latestSectionStory = lastStory as { sort_order?: number } | null;

    await supabase.from("section_stories").insert({
      section_id: section.id,
      story_id: storyId,
      sort_order: (latestSectionStory?.sort_order ?? 0) + 1,
    });
  }

  return { error: null };
}

export async function publishEpisodeToStoryPages(
  supabase: SupabaseClientLike,
  episode: EpisodeLike
) {
  if (!episode.story_id || !episode.episode_number) {
    return { error: null };
  }

  const pagePayload = {
    story_id: episode.story_id,
    page_number: episode.episode_number,
    hindi_text: episode.hindi_script ?? "",
    image_url: episode.image_url ?? "",
    audio_url: episode.audio_url ?? "",
  };

  const { data: existingPage } = await supabase
    .from("story_pages")
    .select("id")
    .eq("story_id", episode.story_id)
    .eq("page_number", episode.episode_number)
    .maybeSingle();

  const page = existingPage as { id?: string } | null;

  if (page?.id) {
    return await supabase
      .from("story_pages")
      .update(pagePayload)
      .eq("id", page.id);
  }

  return await supabase.from("story_pages").insert(pagePayload);
}

export async function publishAllCmsContentToApp(supabase: SupabaseClientLike) {
  const { data: stories, error: storiesError } = await supabase
    .from("stories")
    .select("id");

  if (storiesError) return { error: storiesError };

  for (const story of (stories ?? []) as Array<{ id: string }>) {
    await publishStoryToAppSections(supabase, story.id);
  }

  const { data: episodes, error: episodesError } = await supabase
    .from("episodes")
    .select("id, story_id, episode_number, hindi_script, image_url, audio_url");

  if (episodesError) return { error: episodesError };

  for (const episode of (episodes ?? []) as EpisodeLike[]) {
    await publishEpisodeToStoryPages(supabase, episode);
  }

  return { error: null };
}
