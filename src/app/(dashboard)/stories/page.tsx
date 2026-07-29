"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export default function StoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("stories")
      .select("*, story_categories(title)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setStories(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;
    await supabase.from("stories").delete().eq("id", id);
    fetchStories();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Stories</h1>
        <Link href="/stories/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Story
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Duration (s)</TableHead>
              <TableHead>Total Pages</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading stories...
                </TableCell>
              </TableRow>
            ) : stories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No stories found.
                </TableCell>
              </TableRow>
            ) : (
              stories.map((story) => (
                <TableRow key={story.id}>
                  <TableCell className="font-medium">{story.title}</TableCell>
                  <TableCell>{story.story_categories?.title || "-"}</TableCell>
                  <TableCell>{story.duration_seconds || 0}s</TableCell>
                  <TableCell>{story.total_pages || 0}</TableCell>
                  <TableCell>{story.is_premium ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleDelete(story.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
