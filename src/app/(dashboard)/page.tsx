"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, ListMusic, Tags } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    stories: 0,
    episodes: 0,
    categories: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [stories, episodes, categories] = await Promise.all([
        supabase.from("stories").select("*", { count: "exact", head: true }),
        supabase.from("episodes").select("*", { count: "exact", head: true }),
        supabase
          .from("story_categories")
          .select("*", { count: "exact", head: true }),
      ]);

      setStats({
        stories: stories.count || 0,
        episodes: episodes.count || 0,
        categories: categories.count || 0,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Stories */}
        <Link href="/stories" className="block">
          <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Stories
              </CardTitle>
              <Book className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">{stats.stories}</div>
            </CardContent>
          </Card>
        </Link>

        {/* Episodes */}
        <Link href="/episodes" className="block">
          <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Episodes
              </CardTitle>
              <ListMusic className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">{stats.episodes}</div>
            </CardContent>
          </Card>
        </Link>

        {/* Categories */}
        <Link href="/categories" className="block">
          <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categories
              </CardTitle>
              <Tags className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">{stats.categories}</div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}