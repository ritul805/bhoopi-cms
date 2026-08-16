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
  storyInsideCardThumbnailFolder,
  STORY_ASSETS_BUCKET,
} from "@/lib/storagePaths";

export default function NewStoryInsideCard() {
  const router = useRouter();
  const [storyCards, setStoryCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    story_card_id: "",
    title: "",
    thumbnail_url: "",
    cover_url: "",
    duration_seconds: 0,
    sort_order: 0,
  });

  useEffect(() => {
    const fetchStoryCards = async () => {
      const { data, error } = await supabase
        .from("story_cards")
        .select("id, title")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        alert("Could not load story cards: " + error.message);
        return;
      }
      setStoryCards(data || []);
    };
    fetchStoryCards();
  }, []);

  const selectedCard = useMemo(
    () => storyCards.find((card) => card.id === formData.story_card_id),
    [formData.story_card_id, storyCards]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.thumbnail_url) {
      alert("Please upload a story thumbnail before saving.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("stories").insert([
      {
        story_card_id: formData.story_card_id,
        title: formData.title.trim(),
        thumbnail_url: formData.thumbnail_url,
        cover_url: formData.cover_url || formData.thumbnail_url,
        duration_seconds: formData.duration_seconds || 0,
        sort_order: formData.sort_order || 0,
      },
    ]);
    setLoading(false);

    if (error) {
      alert("Error creating story: " + error.message);
      return;
    }

    router.push("/stories");
  };

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Create Story Inside Card</h1>
      <Card>
        <CardHeader>
          <CardTitle>Child Story</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="story_card_id">Parent Story Card</Label>
              <select
                id="story_card_id"
                required
                value={formData.story_card_id}
                onChange={(event) =>
                  setFormData({ ...formData, story_card_id: event.target.value })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select story card...</option>
                {storyCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                placeholder="e.g. Vasudev ka vachan"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration_seconds">Duration Seconds</Label>
                <Input
                  id="duration_seconds"
                  type="number"
                  value={formData.duration_seconds}
                  onChange={(event) =>
                    setFormData({ ...formData, duration_seconds: parseInt(event.target.value, 10) || 0 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(event) =>
                    setFormData({ ...formData, sort_order: parseInt(event.target.value, 10) || 0 })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Thumbnail Image</Label>
              {!selectedCard || !formData.title.trim() ? (
                <p className="text-sm text-amber-600">Select parent card and enter story title first.</p>
              ) : (
                <MediaUploader
                  bucket={STORY_ASSETS_BUCKET}
                  folder={storyInsideCardThumbnailFolder(selectedCard.title, formData.title)}
                  fileName={(extension) => `thumbnail.${extension || "webp"}`}
                  onUploadSuccess={(url) =>
                    setFormData({ ...formData, thumbnail_url: url, cover_url: formData.cover_url || url })
                  }
                />
              )}
              {formData.thumbnail_url && (
                <img
                  src={formData.thumbnail_url}
                  alt="Story thumbnail"
                  className="mt-2 h-32 w-32 rounded-md object-cover"
                />
              )}
            </div>

            <div className="grid gap-2">
              <Label>Cover Image Optional</Label>
              {!selectedCard || !formData.title.trim() ? (
                <p className="text-sm text-amber-600">Select parent card and enter story title first.</p>
              ) : (
                <MediaUploader
                  bucket={STORY_ASSETS_BUCKET}
                  folder={storyInsideCardThumbnailFolder(selectedCard.title, formData.title)}
                  fileName={(extension) => `cover.${extension || "webp"}`}
                  onUploadSuccess={(url) => setFormData({ ...formData, cover_url: url })}
                />
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Story"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
