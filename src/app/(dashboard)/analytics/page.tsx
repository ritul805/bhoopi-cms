"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarDays, RefreshCw, Search, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

type Profile = { id: string; user_id: string; avatar_url: string | null; created_at: string };
type AnalyticsEvent = {
  id: string;
  user_id: string | null;
  event_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};
type ChildProfile = {
  id: string;
  parent_id: string;
  age: number | null;
  gender: string | null;
  locale: string | null;
  created_at: string;
};

const rangeOptions = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
] as const;

function startDate(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days + 1);
  return date;
}

function shortId(value: string | null) {
  if (!value) return "Anonymous";
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AnalyticsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [range, setRange] = useState(30);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    const since = startDate(range).toISOString();
    const [profilesResult, eventsResult, childrenResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("id,user_id,avatar_url,created_at")
        .order("created_at", { ascending: false })
        .limit(5000),
      supabase
        .from("analytics_events")
        .select("id,user_id,event_type,metadata,created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(5000),
      supabase
        .from("child_profiles")
        .select("id,parent_id,age,gender,locale,created_at")
        .order("created_at", { ascending: false })
        .limit(5000),
    ]);

    const firstError = profilesResult.error || eventsResult.error || childrenResult.error;
    if (firstError) {
      console.error("Could not load analytics:", firstError);
      setError(firstError.message);
    } else {
      setProfiles(profilesResult.data || []);
      setEvents(eventsResult.data || []);
      setChildren(childrenResult.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, [range]);

  const rangeStart = useMemo(() => startDate(range), [range]);
  const signupsInRange = useMemo(
    () => profiles.filter((profile) => new Date(profile.created_at) >= rangeStart),
    [profiles, rangeStart]
  );
  const activeUsers = useMemo(
    () => new Set(events.map((event) => event.user_id).filter(Boolean)).size,
    [events]
  );
  const eventsByType = useMemo(() => {
    const counts = new Map<string, number>();
    events.forEach((event) => counts.set(event.event_type || "unknown", (counts.get(event.event_type || "unknown") || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [events]);

  const signupTrend = useMemo(() => {
    const points = Array.from({ length: range }, (_, index) => {
      const date = new Date(rangeStart);
      date.setDate(date.getDate() + index);
      return { key: date.toISOString().slice(0, 10), date, count: 0 };
    });
    const byDay = new Map(points.map((point) => [point.key, point]));
    signupsInRange.forEach((profile) => {
      const point = byDay.get(profile.created_at.slice(0, 10));
      if (point) point.count += 1;
    });
    return points;
  }, [range, rangeStart, signupsInRange]);
  const maxSignups = Math.max(1, ...signupTrend.map((point) => point.count));

  const lastActivityByUser = useMemo(() => {
    const result = new Map<string, AnalyticsEvent>();
    events.forEach((event) => {
      if (event.user_id && !result.has(event.user_id)) result.set(event.user_id, event);
    });
    return result;
  }, [events]);
  const childrenByParent = useMemo(() => {
    const result = new Map<string, ChildProfile[]>();
    children.forEach((child) => result.set(child.parent_id, [...(result.get(child.parent_id) || []), child]));
    return result;
  }, [children]);

  const visibleProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return profiles;
    return profiles.filter((profile) => profile.user_id.toLowerCase().includes(query) || profile.id.toLowerCase().includes(query));
  }, [profiles, search]);

  const metrics = [
    { label: "Total customers", value: profiles.length, icon: Users },
    { label: `Signups · ${range}d`, value: signupsInRange.length, icon: UserPlus },
    { label: `Active users · ${range}d`, value: activeUsers, icon: Activity },
    { label: `Events · ${range}d`, value: events.length, icon: CalendarDays },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">Customer signups and first-party app activity.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border bg-white p-1">
            {rangeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRange(option.value)}
                className={`rounded px-3 py-1.5 text-sm font-medium ${range === option.value ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={loadAnalytics} disabled={loading} title="Refresh analytics">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </header>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-lg border bg-white p-5">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{metric.label}</span>
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-3 text-3xl font-semibold tabular-nums">{loading ? "—" : metric.value.toLocaleString()}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-semibold">Signup trend</h2>
            <span className="text-xs text-gray-500">Daily registrations</span>
          </div>
          <div className="mt-6 flex h-44 items-end gap-1" aria-label="Daily signup chart">
            {signupTrend.map((point) => (
              <div key={point.key} className="group relative flex h-full min-w-0 flex-1 items-end">
                <div
                  className="w-full rounded-t bg-indigo-500 transition-colors group-hover:bg-indigo-600"
                  style={{ height: `${Math.max(point.count ? 8 : 2, (point.count / maxSignups) * 100)}%` }}
                />
                <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                  {point.date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}: {point.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-5">
          <h2 className="font-semibold">Top activity</h2>
          <div className="mt-4 space-y-3">
            {eventsByType.length === 0 ? (
              <p className="text-sm text-gray-500">No activity recorded in this period.</p>
            ) : (
              eventsByType.slice(0, 8).map(([eventType, count]) => (
                <div key={eventType} className="flex items-center justify-between gap-4 text-sm">
                  <span className="truncate text-gray-700">{eventType}</span>
                  <span className="rounded bg-gray-100 px-2 py-1 font-medium tabular-nums">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div>
            <h2 className="font-semibold">Customers</h2>
            <p className="text-xs text-gray-500">Signup and recent activity details from Supabase.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search user ID" className="pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Signup</th>
                <th className="px-4 py-3 font-medium">Children</th>
                <th className="px-4 py-3 font-medium">Last activity</th>
                <th className="px-4 py-3 font-medium">Event</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visibleProfiles.map((profile) => {
                const activity = lastActivityByUser.get(profile.user_id);
                const childCount = (childrenByParent.get(profile.id) || childrenByParent.get(profile.user_id) || []).length;
                return (
                  <tr key={profile.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs" title={profile.user_id}>{shortId(profile.user_id)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(profile.created_at)}</td>
                    <td className="px-4 py-3 tabular-nums">{childCount}</td>
                    <td className="px-4 py-3 text-gray-600">{activity ? formatDate(activity.created_at) : "No activity"}</td>
                    <td className="px-4 py-3"><span className="rounded bg-gray-100 px-2 py-1 text-xs">{activity?.event_type || "—"}</span></td>
                  </tr>
                );
              })}
              {!loading && visibleProfiles.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border bg-white">
        <div className="border-b p-4">
          <h2 className="font-semibold">Recent activity</h2>
        </div>
        <div className="divide-y">
          {events.slice(0, 20).map((event) => (
            <div key={event.id} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[180px_1fr_180px] sm:items-center">
              <span className="font-mono text-xs text-gray-500">{shortId(event.user_id)}</span>
              <span className="font-medium">{event.event_type || "Unknown event"}</span>
              <span className="text-gray-500 sm:text-right">{formatDate(event.created_at)}</span>
            </div>
          ))}
          {!loading && events.length === 0 && <p className="px-4 py-10 text-center text-sm text-gray-500">No activity recorded.</p>}
        </div>
      </section>
    </div>
  );
}
