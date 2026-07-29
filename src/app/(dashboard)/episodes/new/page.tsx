"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaUploader } from "@/components/MediaUploader";

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
      const { data } = await supabase.from("stories").select("id, title");
      if (data) setStories(data);
    };
    fetchStories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("episodes").insert([formData]);

    if (!error) {
      if (formData.story_id) {
        const { data: epData } = await supabase
          .from("episodes")
          .select("duration_seconds")
          .eq("story_id", formData.story_id);
        
        if (epData) {
          const totalPages = epData.length;
          const totalDuration = epData.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);
          await supabase
            .from("stories")
            .update({ total_pages: totalPages, duration_seconds: totalDuration })
            .eq("id", formData.story_id);
        }
      }
      router.push("/episodes");
    } else {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  const getAudioFolder = () => {
    const selectedStory = stories.find(s => s.id === formData.story_id);
    if (!selectedStory || !selectedStory.title) return "stories/audio";
    return `stories/${selectedStory.title}/audio`;
  };

  const getImageFolder = () => {
    const selectedStory = stories.find(s => s.id === formData.story_id);
    if (!selectedStory || !selectedStory.title) return "stories/images";
    return `stories/${selectedStory.title}/images`;
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">New Episode</h1>

      <Card>
        <CardHeader>
          <CardTitle>Episode Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="story">Story</Label>
              <select
                id="story"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.story_id}
                onChange={(e) => setFormData({ ...formData, story_id: e.target.value })}
              >
                <option value="" disabled>Select a story...</option>
                {stories.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="episode_number">Episode Number</Label>
                <Input
                  id="episode_number"
                  type="number"
                  required
                  value={formData.episode_number}
                  onChange={(e) => setFormData({ ...formData, episode_number: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duration_seconds">Duration (seconds)</Label>
                <Input
                  id="duration_seconds"
                  type="number"
                  value={formData.duration_seconds}
                  onChange={(e) => setFormData({ ...formData, duration_seconds: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="is_preview"
                checked={formData.is_preview}
                onChange={(e) => setFormData({ ...formData, is_preview: e.target.checked })}
              />
              <Label htmlFor="is_preview">Is Preview</Label>
            </div>

            <div className="grid gap-2">
              <Label>Audio File</Label>
              {!formData.story_id ? (
                <p className="text-sm text-amber-600">Please select a Story first to upload the audio to the correct folder.</p>
              ) : (
                <MediaUploader
                  bucket="story-assets"
                  folder={getAudioFolder()}
                  accept="audio/*"
                  onUploadSuccess={(url, durationSeconds) => setFormData((prev) => ({
                    ...prev,
                    audio_url: url,
                    duration_seconds: durationSeconds && durationSeconds > 0 ? durationSeconds : prev.duration_seconds
                  }))}
                />
              )}
              {formData.audio_url && (
                <p className="text-sm text-green-600 mt-2">Audio uploaded successfully!</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Image File</Label>
              {!formData.story_id ? (
                <p className="text-sm text-amber-600">Please select a Story first to upload the image to the correct folder.</p>
              ) : (
                <MediaUploader
                  bucket="story-assets"
                  folder={getImageFolder()}
                  accept="image/*"
                  onUploadSuccess={(url) => setFormData({ ...formData, image_url: url })}
                />
              )}
              {formData.image_url && (
                <p className="text-sm text-green-600 mt-2">Image uploaded successfully!</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hindi_script">Hindi Script</Label>
              <textarea
                id="hindi_script"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.hindi_script}
                onChange={(e) => setFormData({ ...formData, hindi_script: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="english_script">English Script</Label>
              <textarea
                id="english_script"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.english_script}
                onChange={(e) => setFormData({ ...formData, english_script: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={loading}>Save Episode</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
