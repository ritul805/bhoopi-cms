"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { MediaUploader } from "@/components/MediaUploader";

export default function EditStory() {
  const router = useRouter();
  const params = useParams();

  const storyId = params.id as string;

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    moral_lesson: "",
    cover_url: "",
    thumbnail_url: "",
    duration_seconds: 0,
    total_pages: 0,
    is_premium: false,
    is_featured: false,
  });

  useEffect(() => {
    if (!storyId) return;

    const fetchData = async () => {
      setLoading(true);

      // Fetch story
      const { data: story, error: storyError } = await supabase
        .from("stories")
        .select("*")
        .eq("id", storyId)
        .single();

      if (storyError) {
        console.error("Error fetching story:", storyError);
        alert("Unable to load story.");
        router.push("/stories");
        return;
      }

      // Fetch categories
      const { data: categoryData, error: categoryError } = await supabase
        .from("story_categories")
        .select("id, title")
        .order("title");

      if (categoryError) {
        console.error("Error fetching categories:", categoryError);
      }

      // Fetch selected categories
      const { data: selectedCategories, error: selectedError } =
        await supabase
          .from("story_category_links")
          .select("category_id")
          .eq("story_id", storyId);

      if (selectedError) {
        console.error(
          "Error fetching selected categories:",
          selectedError
        );
      }

      setCategories(categoryData || []);

      setSelectedCategoryIds(
        selectedCategories?.map((item) => item.category_id) || []
      );

      setFormData({
        title: story.title || "",
        description: story.description || "",
        moral_lesson: story.moral_lesson || "",
        cover_url: story.cover_url || "",
        thumbnail_url: story.thumbnail_url || "",
        duration_seconds: story.duration_seconds || 0,
        total_pages: story.total_pages || 0,
        is_premium: story.is_premium || false,
        is_featured: story.is_featured || false,
      });

      setLoading(false);
    };

    fetchData();
  }, [storyId, router]);

  const handleCategoryToggle = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id)
        ? prev.filter((catId) => catId !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);

    const payload = {
      ...formData,
      category_id: selectedCategoryIds[0] || null,
      thumbnail_url: formData.thumbnail_url || formData.cover_url,
    };

    // Update story
    const { error: updateError } = await supabase
      .from("stories")
      .update(payload)
      .eq("id", storyId);

    if (updateError) {
      alert("Error updating story: " + updateError.message);
      setSaving(false);
      return;
    }

    // Remove old category links
    const { error: deleteLinksError } = await supabase
      .from("story_category_links")
      .delete()
      .eq("story_id", storyId);

    if (deleteLinksError) {
      console.error(
        "Error removing old category links:",
        deleteLinksError
      );
    }

    // Add updated category links
    if (selectedCategoryIds.length > 0) {
      const linksPayload = selectedCategoryIds.map((categoryId) => ({
        story_id: storyId,
        category_id: categoryId,
      }));

      const { error: linkError } = await supabase
        .from("story_category_links")
        .insert(linksPayload);

      if (linkError) {
        console.error("Error updating category links:", linkError);
      }
    }

    router.push("/stories");
    router.refresh();

    setSaving(false);
  };

  const getStoryUploadFolder = () => {
    if (!formData.title) return "stories";

    return `stories/${formData.title}/images`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading story...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">
        Edit Story
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Story Details</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">

            {/* TITLE */}
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>

              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                  })
                }
              />
            </div>

            {/* CATEGORIES */}
            <div className="grid gap-2">
              <Label>Categories (Select Multiple)</Label>

              {categories.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No categories found.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 border rounded-md bg-gray-50/50 max-h-48 overflow-y-auto">
                  {categories.map((category) => {
                    const isSelected =
                      selectedCategoryIds.includes(category.id);

                    return (
                      <label
                        key={category.id}
                        onClick={() =>
                          handleCategoryToggle(category.id)
                        }
                        className={`flex items-center gap-2 p-2 rounded-md border text-sm cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 border-blue-500 font-medium text-blue-900"
                            : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />

                        <span className="truncate">
                          {category.title}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="grid gap-2">
              <Label htmlFor="description">
                Description
              </Label>

              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
              />
            </div>

            {/* MORAL LESSON */}
            <div className="grid gap-2">
              <Label htmlFor="moral_lesson">
                Moral Lesson
              </Label>

              <Input
                id="moral_lesson"
                value={formData.moral_lesson}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    moral_lesson: e.target.value,
                  })
                }
              />
            </div>

            {/* DURATION + PAGES */}
            <div className="grid grid-cols-2 gap-4">

              <div className="grid gap-2">
                <Label htmlFor="duration_seconds">
                  Duration (seconds)
                </Label>

                <Input
                  id="duration_seconds"
                  type="number"
                  value={formData.duration_seconds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_seconds:
                        parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="total_pages">
                  Total Pages
                </Label>

                <Input
                  id="total_pages"
                  type="number"
                  value={formData.total_pages}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      total_pages:
                        parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

            </div>

            {/* PREMIUM + FEATURED */}
            <div className="flex items-center gap-4">

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_premium"
                  checked={formData.is_premium}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_premium: e.target.checked,
                    })
                  }
                />

                <Label htmlFor="is_premium">
                  Premium
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_featured: e.target.checked,
                    })
                  }
                />

                <Label htmlFor="is_featured">
                  Featured
                </Label>
              </div>

            </div>

            {/* COVER IMAGE */}
            <div className="grid gap-2">
              <Label>Cover Image</Label>

              <MediaUploader
                bucket="story-assets"
                folder={getStoryUploadFolder()}
                onUploadSuccess={(url) =>
                  setFormData({
                    ...formData,
                    cover_url: url,
                    thumbnail_url: url,
                  })
                }
              />

              {formData.cover_url && (
                <img
                  src={formData.cover_url}
                  alt="Cover"
                  className="h-32 w-32 object-cover rounded-md mt-2"
                />
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-4 mt-4">

              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? "Updating..." : "Update Story"}
              </Button>

            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}