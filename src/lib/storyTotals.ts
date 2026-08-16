import { supabase } from "@/lib/supabase";

/**
 * Recomputes `total_pages` and `duration_seconds` on a story by reading its
 * episodes back from the database.
 *
 * Every episode mutation (create, edit, move, delete) must call this, otherwise
 * the story dashboard shows counts that drift from reality. Previously each
 * call site rolled its own version of this logic, which is how the delete flow
 * ended up with none at all and the create flow ended up updating duration but
 * not page count.
 *
 * Totals are derived from the episodes table rather than adjusted
 * incrementally, so a stale value self-corrects on the next mutation.
 *
 * @param storyId Story to recalculate. No-op for empty/null input.
 * @returns `{ ok }`, plus the new totals when successful. Never throws — the
 *          caller decides whether a totals failure should block the user.
 */
export async function recalculateStoryTotals(storyId?: string | null): Promise<{
  ok: boolean;
  error?: string;
  totalPages?: number;
  totalDuration?: number;
}> {
  if (!storyId) {
    return { ok: true, totalPages: 0, totalDuration: 0 };
  }

  const { data, error: fetchError } = await supabase
    .from("episodes")
    .select("duration_seconds")
    .eq("story_id", storyId);

  if (fetchError) {
    return { ok: false, error: fetchError.message };
  }

  const episodes = data ?? [];
  const totalPages = episodes.length;
  const totalDuration = episodes.reduce(
    (sum, episode) => sum + (episode.duration_seconds || 0),
    0
  );

  const { error: updateError } = await supabase
    .from("stories")
    .update({ total_pages: totalPages, duration_seconds: totalDuration })
    .eq("id", storyId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  return { ok: true, totalPages, totalDuration };
}

/**
 * Recalculates several stories at once, skipping blanks and duplicates.
 *
 * Needed when an episode moves between stories: both the story it left and the
 * story it joined are now wrong, and updating only the destination leaves the
 * origin permanently overstated.
 */
export async function recalculateStoryTotalsFor(
  storyIds: (string | null | undefined)[]
): Promise<{ ok: boolean; errors: string[] }> {
  const unique = Array.from(
    new Set(storyIds.filter((id): id is string => !!id))
  );

  const results = await Promise.all(unique.map(recalculateStoryTotals));
  const errors = results
    .filter((result) => !result.ok)
    .map((result) => result.error || "Unknown error");

  return { ok: errors.length === 0, errors };
}
