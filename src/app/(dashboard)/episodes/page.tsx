"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, ChevronRight, BookOpen, Music, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface GroupedStory {
  storyId: string;
  storyTitle: string;
  thumbnailUrl: string;
  episodes: any[];
  totalDuration: number;
}

export default function EpisodesPage() {
  const [groupedStories, setGroupedStories] = useState<GroupedStory[]>([]);
  const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const fetchEpisodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("episodes")
      .select("*, stories(id, title, thumbnail_url, cover_url)")
      .order("episode_number", { ascending: true });
    
    if (!error && data) {
      // Group episodes by story
      const groupsMap: Record<string, GroupedStory> = {};

      data.forEach((ep) => {
        const storyId = ep.stories?.id || "unassigned";
        const storyTitle = ep.stories?.title || "Unassigned Story";
        const thumbnailUrl = ep.stories?.thumbnail_url || ep.stories?.cover_url || "";

        if (!groupsMap[storyId]) {
          groupsMap[storyId] = {
            storyId,
            storyTitle,
            thumbnailUrl,
            episodes: [],
            totalDuration: 0,
          };
        }

        groupsMap[storyId].episodes.push(ep);
        groupsMap[storyId].totalDuration += ep.duration_seconds || 0;
      });

      const groupsArray = Object.values(groupsMap);
      setGroupedStories(groupsArray);

      // By default, expand all stories
      const initialExpanded: Record<string, boolean> = {};
      groupsArray.forEach((group) => {
        initialExpanded[group.storyId] = true;
      });
      setExpandedStories(initialExpanded);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const toggleExpand = (storyId: string) => {
    setExpandedStories((prev) => ({
      ...prev,
      [storyId]: !prev[storyId],
    }));
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this episode?")) return;
    await supabase.from("episodes").delete().eq("id", id);
    fetchEpisodes();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Episodes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Grouped by stories. Click on a story to view or manage its episodes.
          </p>
        </div>
        <Link href="/episodes/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Episode
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="rounded-md border bg-white p-8 text-center text-muted-foreground">
          Loading episodes grouped by story...
        </div>
      ) : groupedStories.length === 0 ? (
        <div className="rounded-md border bg-white p-8 text-center text-muted-foreground">
          No episodes found.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groupedStories.map((group) => {
            const isExpanded = !!expandedStories[group.storyId];
            return (
              <div key={group.storyId} className="rounded-xl border bg-white shadow-sm overflow-hidden transition-all">
                {/* Story Header Bar */}
                <button
                  onClick={() => toggleExpand(group.storyId)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50/80 hover:bg-gray-100/80 transition-colors text-left border-b border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    {group.thumbnailUrl ? (
                      <img
                        src={group.thumbnailUrl}
                        alt={group.storyTitle}
                        className="h-14 w-14 object-cover rounded-lg border bg-gray-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-lg border bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                        <BookOpen className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{group.storyTitle}</h2>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {group.episodes.length} {group.episodes.length === 1 ? "Episode" : "Episodes"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Music className="h-3.5 w-3.5" />
                          {group.totalDuration}s total duration
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="text-xs font-medium uppercase tracking-wider hidden sm:inline">
                      {isExpanded ? "Collapse" : "Expand"}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </div>
                </button>

                {/* Expanded Episodes Table */}
                {isExpanded && (
                  <div className="p-2 sm:p-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Ep #</TableHead>
                          <TableHead className="w-20">Image</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Audio Player</TableHead>
                          <TableHead>Preview</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.episodes.map((episode) => (
                          <TableRow key={episode.id}>
                            <TableCell className="font-mono text-sm">{episode.episode_number}</TableCell>
                            <TableCell>
                              {episode.image_url ? (
                                <img
                                  src={episode.image_url}
                                  alt={episode.title}
                                  className="h-12 w-12 object-cover rounded-md border bg-gray-100 flex-shrink-0"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-md border bg-gray-100 flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                                  <ImageIcon className="h-4 w-4" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{episode.title}</span>
                                {episode.description && (
                                  <span className="text-xs text-muted-foreground truncate max-w-xs">
                                    {episode.description}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{episode.duration_seconds || 0}s</TableCell>
                            <TableCell>
                              {episode.audio_url ? (
                                <audio controls src={episode.audio_url} className="h-8 max-w-[200px]" />
                              ) : (
                                <span className="text-xs text-gray-400">No Audio</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {episode.is_preview ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  Free Preview
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  Standard
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => handleDelete(episode.id, e)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
