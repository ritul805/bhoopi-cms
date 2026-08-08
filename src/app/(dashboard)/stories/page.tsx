"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      .select("*, story_categories!story_category_links(id, title)")
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

  const getCategoryBadges = (story: any): string[] => {
    if (
      Array.isArray(story.story_categories) &&
      story.story_categories.length > 0
    ) {
      return story.story_categories
        .map((c: any) => c.title)
        .filter(Boolean);
    }

    return [];
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Stories</h1>

        <Link href="/stories/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Story
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Duration (s)</TableHead>
              <TableHead>Total Pages</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading stories...
                </TableCell>
              </TableRow>
            ) : stories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No stories found.
                </TableCell>
              </TableRow>
            ) : (
              stories.map((story) => {
                const categoryList = getCategoryBadges(story);

                return (
                  <TableRow key={story.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {story.thumbnail_url || story.cover_url ? (
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

                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {categoryList.map((title, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                          >
                            {title}
                          </span>
                        ))}

                        {categoryList.length === 0 && (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {story.duration_seconds || 0}s
                    </TableCell>

                    <TableCell>
                      {story.total_pages || 0}
                    </TableCell>

                    <TableCell>
                      {story.is_premium ? "Yes" : "No"}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">

                        {/* EDIT BUTTON */}
                        <Link href={`/stories/${story.id}/edit`}>
                          <Button
                            variant="outline"
                            size="icon"
                            title="Edit Story"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>

                        {/* DELETE BUTTON */}
                        <Button
                          variant="outline"
                          size="icon"
                          title="Delete Story"
                          onClick={() => handleDelete(story.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>

                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}