export const STORY_ASSETS_BUCKET = "story-assets";

function slugPart(value: string, fallback: string) {
  const trimmed = value.trim();
  const slug = trimmed
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (slug) return slug;

  let hash = 0;
  for (let index = 0; index < trimmed.length; index += 1) {
    hash = (hash * 31 + trimmed.charCodeAt(index)) >>> 0;
  }

  return `${fallback}-${hash.toString(36)}`;
}

function safeExtension(extension: string) {
  return extension.replace(/^\./, "").replace(/[^a-z0-9]/gi, "").toLowerCase();
}

export function episodeImageAssetName(episodeNumber: number, extension: string) {
  return `episode_image-${String(episodeNumber || 1).padStart(3, "0")}.${safeExtension(extension) || "webp"}`;
}

export function episodeAudioAssetName(episodeNumber: number, extension: string) {
  return `episode_audio-${String(episodeNumber || 1).padStart(3, "0")}.${safeExtension(extension) || "mp3"}`;
}

export function storyCardFolder(cardTitle: string) {
  return `story_cards/${slugPart(cardTitle, "card")}`;
}

export function storyCardThumbnailFolder(cardTitle: string) {
  return `${storyCardFolder(cardTitle)}/thumbnail`;
}

export function storyCardHeroBannerFolder(cardTitle: string) {
  return `${storyCardFolder(cardTitle)}/hero_banner`;
}

export function storyInsideCardFolder(cardTitle: string, storyTitle: string) {
  return `${storyCardFolder(cardTitle)}/stories/${slugPart(storyTitle, "story")}`;
}

export function storyInsideCardThumbnailFolder(
  cardTitle: string,
  storyTitle: string
) {
  return `${storyInsideCardFolder(cardTitle, storyTitle)}/thumbnail`;
}

export function episodeImageFolder(cardTitle: string, storyTitle: string) {
  return `${storyInsideCardFolder(cardTitle, storyTitle)}/images`;
}

export function episodeAudioFolder(cardTitle: string, storyTitle: string) {
  return `${storyInsideCardFolder(cardTitle, storyTitle)}/audio`;
}
