"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaUploader } from "@/components/MediaUploader";
import { supabase } from "@/lib/supabase";
import {
  episodeAudioAssetName,
  episodeAudioFolderById,
  episodeImageAssetName,
  episodeImageFolderById,
  STORY_ASSETS_BUCKET,
} from "@/lib/storagePaths";

export default function NewEpisode() {
  const router = useRouter();
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    story_id: "",
    episode_number: 1,
    description: "",
    audio_url: "",
    image_url: "",
    duration_seconds: 0,
    hindi_script: "",
    english_script: "",
    is_preview: false,
  });

  useEffect(() => {
    const fetchStories = async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("id, title, story_cards(id, title)")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        alert("Could not load stories: " + error.message);
        return;
      }
      setStories(data || []);
    };
    fetchStories();
  }, []);

  const selectedStory = useMemo(
    () => stories.find((story) => story.id === formData.story_id),
    [formData.story_id, stories]
  );

  const selectedCardId = selectedStory?.story_cards?.id || "";
  const selectedStoryId = selectedStory?.id || "";

  const resetUploadedMedia = (nextFormData: typeof formData) => ({
    ...nextFormData,
    audio_url: "",
    image_url: "",
    duration_seconds: 0,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.image_url || !formData.audio_url) {
      alert("Please upload both episode image and episode audio before saving.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("episodes").insert([
      {
        story_id: formData.story_id,
        episode_number: formData.episode_number,
        title: formData.title.trim(),
        image_url: formData.image_url,
        audio_url: formData.audio_url,
        duration_seconds: formData.duration_seconds || 0,
      },
    ]);

    if (!error && formData.story_id) {
      const { data: epData } = await supabase
        .from("episodes")
        .select("duration_seconds")
        .eq("story_id", formData.story_id);

      if (epData) {
        const totalDuration = epData.reduce(
          (acc, curr) => acc + (curr.duration_seconds || 0),
          0
        );
        await supabase
          .from("stories")
          .update({ duration_seconds: totalDuration })
          .eq("id", formData.story_id);
      }
    }

    setLoading(false);
    if (error) {
      alert("Error uploading episode: " + error.message);
      return;
    }

    router.push("/episodes");
  };

  const canUploadMedia = selectedCardId && selectedStoryId;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Upload Episode</h1>
      <Card>
        <CardHeader>
          <CardTitle>Playable Episode</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="story">Story Inside Card</Label>
              <select
                id="story"
                required
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={formData.story_id}
                onChange={(event) =>
                  setFormData(resetUploadedMedia({ ...formData, story_id: event.target.value }))
                }
              >
                <option value="">Select child story...</option>
                {stories.map((story) => (
                  <option key={story.id} value={story.id}>
                    {story.story_cards?.title || "No Card"} / {story.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Episode Title</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(event) => setFormData({ ...formData, title: event.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="episode_number">Episode Number</Label>
                <Input
                  id="episode_number"
                  type="number"
                  min="1"
                  required
                  value={formData.episode_number}
                  onChange={(event) =>
                    setFormData(
                      resetUploadedMedia({
                        ...formData,
                        episode_number: parseInt(event.target.value, 10) || 1,
                      })
                    )
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration_seconds">Duration (seconds)</Label>
                <Input
                  id="duration_seconds"
                  type="number"
                  value={formData.duration_seconds}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      duration_seconds: parseInt(event.target.value, 10) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Episode Image</Label>
              {!canUploadMedia ? (
                <p className="text-sm text-amber-600">Select a child story first.</p>
              ) : (
                <MediaUploader
                  bucket={STORY_ASSETS_BUCKET}
                  folder={episodeImageFolderById(selectedCardId, selectedStoryId)}
                  fileName={(extension) => episodeImageAssetName(formData.episode_number, extension || "webp")}
                  accept="image/*"
                  onUploadSuccess={(url) => setFormData({ ...formData, image_url: url })}
                />
              )}
            </div>

            <div className="grid gap-2">
              <Label>Episode Audio</Label>
              {!canUploadMedia ? (
                <p className="text-sm text-amber-600">Select a child story first.</p>
              ) : (
                <MediaUploader
                  bucket={STORY_ASSETS_BUCKET}
                  folder={episodeAudioFolderById(selectedCardId, selectedStoryId)}
                  fileName={(extension) => episodeAudioAssetName(formData.episode_number, extension || "mp3")}
                  accept="audio/*"
                  onUploadSuccess={(url, durationSeconds) =>
                    setFormData((prev) => ({
                      ...prev,
                      audio_url: url,
                      duration_seconds:
                        durationSeconds && durationSeconds > 0
                          ? durationSeconds
                          : prev.duration_seconds,
                    }))
                  }
                />
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hindi_script">Hindi Script</Label>
              <textarea
                id="hindi_script"
                className="min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.hindi_script}
                onChange={(event) => setFormData({ ...formData, hindi_script: event.target.value })}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Episode"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
