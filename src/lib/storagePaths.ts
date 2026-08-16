export const STORY_ASSETS_BUCKET = "story-assets";

export function episodeImageAssetName(episodeNumber: number, extension: string) {
  const safeExtension = extension.replace(/^\./, "");
  return `episode_image-${String(episodeNumber || 1).padStart(3, "0")}.${safeExtension}`;
}

export function episodeAudioAssetName(episodeNumber: number, extension: string) {
  const safeExtension = extension.replace(/^\./, "");
  return `episode_audio-${String(episodeNumber || 1).padStart(3, "0")}.${safeExtension}`;
}

export function storyCardFolder(cardTitle: string) {
  return `story_cards/${cardTitle.trim()}`;
}

export function storyCardThumbnailFolder(cardTitle: string) {
  return `${storyCardFolder(cardTitle)}/thumbnail`;
}

export function storyCardHeroBannerFolder(cardTitle: string) {
  return `${storyCardFolder(cardTitle)}/hero_banner`;
}

export function storyInsideCardFolder(cardTitle: string, storyTitle: string) {
  return `${storyCardFolder(cardTitle)}/stories/${storyTitle.trim()}`;
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
