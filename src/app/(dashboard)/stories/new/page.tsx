"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaUploader } from "@/components/MediaUploader";

export default function NewStory() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
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
    const fetchCategories = async () => {
      const { data } = await supabase.from("story_categories").select("id, title").order("title");
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      category_id: formData.category_id || null,
      thumbnail_url: formData.thumbnail_url || formData.cover_url,
    };

    const { error } = await supabase.from("stories").insert([payload]);

    if (!error) {
      router.push("/stories");
    } else {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  const getStoryUploadFolder = () => {
    if (!formData.title) return "stories";
    return `stories/${formData.title}/images`;
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">New Story</h1>

      <Card>
        <CardHeader>
          <CardTitle>Story Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. kanha ke aane ki khabar"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
                <option value="">Select a Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="moral_lesson">Moral Lesson</Label>
              <Input
                id="moral_lesson"
                value={formData.moral_lesson}
                onChange={(e) => setFormData({ ...formData, moral_lesson: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration_seconds">Duration (seconds)</Label>
                <Input
                  id="duration_seconds"
                  type="number"
                  value={formData.duration_seconds}
                  onChange={(e) => setFormData({ ...formData, duration_seconds: parseInt(e.target.value) || 0 })}
                  placeholder="Auto-calculated from episodes"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="total_pages">Total Pages</Label>
                <Input
                  id="total_pages"
                  type="number"
                  value={formData.total_pages}
                  onChange={(e) => setFormData({ ...formData, total_pages: parseInt(e.target.value) || 0 })}
                  placeholder="Auto-calculated from episodes"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="is_premium"
                  checked={formData.is_premium}
                  onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                />
                <Label htmlFor="is_premium">Premium</Label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                />
                <Label htmlFor="is_featured">Featured</Label>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Cover Image</Label>
              {!formData.title ? (
                <p className="text-sm text-amber-600">Please enter a Title first to upload the cover correctly.</p>
              ) : (
                <MediaUploader
                  bucket="story-assets"
                  folder={getStoryUploadFolder()}
                  onUploadSuccess={(url) => setFormData({ ...formData, cover_url: url, thumbnail_url: url })}
                />
              )}
              {formData.cover_url && (
                <img src={formData.cover_url} alt="Cover" className="h-32 w-32 object-cover rounded-md mt-2" />
              )}
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={loading}>Save Story</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
