"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, Bell, Book, ListMusic, Tags } from "lucide-react";

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

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Customer operations</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review customer activity and communicate important updates.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/analytics" className="block">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-base">Customer analytics</CardTitle>
                  <p className="text-sm font-normal text-muted-foreground">
                    Track signups, active users, event volume, and recent customer activity.
                  </p>
                </div>
                <BarChart3 className="h-5 w-5 shrink-0 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex items-center gap-2 text-sm font-medium text-primary">
                Open analytics
                <ArrowRight className="h-4 w-4" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/notifications" className="block">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-base">Broadcast notification</CardTitle>
                  <p className="text-sm font-normal text-muted-foreground">
                    Send one notification to every registered customer and review delivery history.
                  </p>
                </div>
                <Bell className="h-5 w-5 shrink-0 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex items-center gap-2 text-sm font-medium text-primary">
                Compose notification
                <ArrowRight className="h-4 w-4" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
