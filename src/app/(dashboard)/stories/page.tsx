"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, BookOpen, Pencil } from "lucide-react";
import Link from "next/link";

export default function StoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("stories")
      .select("id, story_card_id, title, thumbnail_url, cover_url, duration_seconds, sort_order, created_at, story_cards(id, title)")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching stories:", error);
    }

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stories Inside Cards</h1>
          <p className="text-sm text-muted-foreground">
            Child stories shown after a user opens a parent Story Card.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/stories/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Story Inside Card
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Parent Story Card</TableHead>
              <TableHead>Duration (s)</TableHead>
              <TableHead>Sort</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading stories...
                </TableCell>
              </TableRow>
            ) : stories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No child stories found.
                </TableCell>
              </TableRow>
            ) : (
              stories.map((story) => (
                  <TableRow key={story.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {(story.thumbnail_url || story.cover_url) ? (
                          <img
                            src={story.thumbnail_url || story.cover_url}
                            alt={story.title}
                            className="h-10 w-10 object-cover rounded-md border bg-gray-100 flex-shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md border bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                            <BookOpen className="h-4 w-4" />
                          </div>
                        )}
                        <span>{story.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>{story.story_cards?.title || "-"}</TableCell>
                    <TableCell>{story.duration_seconds || 0}s</TableCell>
                    <TableCell>{story.sort_order || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/stories/${story.id}/edit`}>
                          <Button variant="outline" size="icon" title="Edit Story">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
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
