"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaUploader } from "@/components/MediaUploader";

export default function NewCategory() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon_url: "",
    theme_color: "#000000",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("story_categories").insert([formData]);

    if (!error) {
      router.push("/categories");
    } else {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">New Category</h1>

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
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
              />
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
              <Label htmlFor="theme_color">Theme Color</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="theme_color"
                  type="color"
                  className="w-16 h-10 p-1"
                  value={formData.theme_color}
                  onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                />
                <span className="text-sm font-mono">{formData.theme_color}</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Icon Image</Label>
              <MediaUploader
                bucket="story-assets"
                folder="icons"
                onUploadSuccess={(url) => setFormData({ ...formData, icon_url: url })}
              />
              {formData.icon_url && (
                <img src={formData.icon_url} alt="Icon" className="h-16 w-16 object-cover rounded-md mt-2" />
              )}
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={loading}>Save Category</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
