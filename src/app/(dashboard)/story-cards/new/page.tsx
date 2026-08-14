"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaUploader } from "@/components/MediaUploader";
import { supabase } from "@/lib/supabase";
import {
  storyCardHeroBannerFolder,
  storyCardThumbnailFolder,
  STORY_ASSETS_BUCKET,
} from "@/lib/storagePaths";

export default function NewStoryCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    thumbnail_url: "",
    hero_banner_url: "",
    category: "",
    sort_order: 0,
    is_active: true,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.thumbnail_url || !formData.hero_banner_url) {
      alert("Please upload both thumbnail image and hero banner image before publishing.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("story_cards").insert([
      {
        title: formData.title.trim(),
        thumbnail_url: formData.thumbnail_url,
        hero_banner_url: formData.hero_banner_url,
        category: formData.category.trim() || null,
        sort_order: formData.sort_order || 0,
        is_active: formData.is_active,
      },
    ]);
    setLoading(false);

    if (error) {
      alert("Error creating story card: " + error.message);
      return;
    }

    router.push("/story-cards");
  };

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Create Story Card</h1>
      <Card>
        <CardHeader>
          <CardTitle>Home Screen Card</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                placeholder="e.g. Shararati Krishna ke karname"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                placeholder="e.g. krishna stories"
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

            <div className="flex items-center gap-2">
              <input
                id="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={(event) => setFormData({ ...formData, is_active: event.target.checked })}
              />
              <Label htmlFor="is_active">Published / Active</Label>
            </div>

            <div className="grid gap-2">
              <Label>Thumbnail Image</Label>
              {!formData.title.trim() ? (
                <p className="text-sm text-amber-600">Enter a title first.</p>
              ) : (
                <MediaUploader
                  bucket={STORY_ASSETS_BUCKET}
                  folder={storyCardThumbnailFolder(formData.title)}
                  fileName={(extension) => `thumbnail.${extension || "webp"}`}
                  onUploadSuccess={(url) => setFormData({ ...formData, thumbnail_url: url })}
                />
              )}
              {formData.thumbnail_url && (
                <img
                  src={formData.thumbnail_url}
                  alt="Story card thumbnail"
                  className="mt-2 h-32 w-32 rounded-md object-cover"
                />
              )}
            </div>

            <div className="grid gap-2">
              <Label>Hero Banner Image</Label>
              {!formData.title.trim() ? (
                <p className="text-sm text-amber-600">Enter a title first.</p>
              ) : (
                <MediaUploader
                  bucket={STORY_ASSETS_BUCKET}
                  folder={storyCardHeroBannerFolder(formData.title)}
                  fileName={(extension) => `hero_banner.${extension || "webp"}`}
                  onUploadSuccess={(url) => setFormData({ ...formData, hero_banner_url: url })}
                />
              )}
              {formData.hero_banner_url && (
                <img
                  src={formData.hero_banner_url}
                  alt="Story card hero banner"
                  className="mt-2 h-32 w-full rounded-md object-cover"
                />
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Story Card"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
