"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BellRing, CheckCircle2, RefreshCw, Send, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

type Profile = { id: string; user_id: string; created_at: string };
type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

function shortId(value: string) {
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

export default function NotificationsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const recipientIds = useMemo(
    () => [...new Set(profiles.map((profile) => profile.user_id).filter(Boolean))],
    [profiles]
  );

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const [profilesResult, notificationsResult] = await Promise.all([
      supabase.from("profiles").select("id,user_id,created_at").order("created_at", { ascending: false }).limit(10000),
      supabase
        .from("notifications")
        .select("id,user_id,title,body,is_read,created_at")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    const firstError = profilesResult.error || notificationsResult.error;
    if (firstError) {
      console.error("Could not load notifications dashboard:", firstError);
      setError(firstError.message);
    } else {
      setProfiles(profilesResult.data || []);
      setNotifications(notificationsResult.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBroadcast = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedTitle = title.trim();
    const normalizedBody = body.trim();
    if (!normalizedTitle || !normalizedBody) {
      setError("Title and message are required.");
      return;
    }
    if (recipientIds.length === 0) {
      setError("No registered customers are available for this broadcast.");
      return;
    }
    if (!confirm(`Send this notification to all ${recipientIds.length.toLocaleString()} customers?`)) return;

    setSending(true);
    setSentCount(0);
    setError(null);
    setSuccess(null);

    for (let offset = 0; offset < recipientIds.length; offset += 200) {
      const batch = recipientIds.slice(offset, offset + 200).map((userId) => ({
        user_id: userId,
        title: normalizedTitle,
        body: normalizedBody,
        is_read: false,
      }));
      const { error: insertError } = await supabase.from("notifications").insert(batch);
      if (insertError) {
        console.error("Could not send notification batch:", insertError);
        setError(`Broadcast stopped after ${offset.toLocaleString()} recipients: ${insertError.message}`);
        setSending(false);
        return;
      }
      setSentCount(Math.min(offset + batch.length, recipientIds.length));
    }

    setSending(false);
    setSuccess(`Notification sent to ${recipientIds.length.toLocaleString()} customers.`);
    setTitle("");
    setBody("");
    await loadData();
  };

  const readCount = notifications.filter((notification) => notification.is_read).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">Send an in-app message to every registered customer.</p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center justify-between text-sm text-gray-500"><span>Recipients</span><Users className="h-4 w-4" /></div>
          <p className="mt-3 text-3xl font-semibold tabular-nums">{loading ? "—" : recipientIds.length.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center justify-between text-sm text-gray-500"><span>Recent deliveries</span><BellRing className="h-4 w-4" /></div>
          <p className="mt-3 text-3xl font-semibold tabular-nums">{loading ? "—" : notifications.length.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center justify-between text-sm text-gray-500"><span>Read in recent list</span><CheckCircle2 className="h-4 w-4" /></div>
          <p className="mt-3 text-3xl font-semibold tabular-nums">{loading ? "—" : readCount.toLocaleString()}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <form onSubmit={handleBroadcast} className="rounded-lg border bg-white p-6">
          <div className="flex items-start justify-between gap-4 border-b pb-5">
            <div>
              <h2 className="font-semibold">Broadcast notification</h2>
              <p className="mt-1 text-sm text-gray-500">A notification row will be created for every recipient.</p>
            </div>
            <span className="rounded bg-indigo-50 px-2.5 py-1 text-sm font-medium text-indigo-700">
              {recipientIds.length.toLocaleString()} recipients
            </span>
          </div>

          <div className="mt-5 grid gap-5">
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="notification-title">Title</Label>
                <span className="text-xs text-gray-400">{title.length}/80</span>
              </div>
              <Input
                id="notification-title"
                value={title}
                onChange={(event) => setTitle(event.target.value.slice(0, 80))}
                placeholder="New stories are waiting"
                disabled={sending}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="notification-body">Message</Label>
                <span className="text-xs text-gray-400">{body.length}/240</span>
              </div>
              <textarea
                id="notification-body"
                value={body}
                onChange={(event) => setBody(event.target.value.slice(0, 240))}
                placeholder="Open Boopi to listen to this week's newest adventures."
                rows={6}
                disabled={sending}
                className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {sending && (
              <div className="rounded-md bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                Sending {sentCount.toLocaleString()} of {recipientIds.length.toLocaleString()}...
              </div>
            )}
            {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {success && <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

            <div className="flex justify-end">
              <Button type="submit" disabled={sending || loading || recipientIds.length === 0} className="gap-2">
                <Send className="h-4 w-4" /> {sending ? "Sending..." : "Send to all customers"}
              </Button>
            </div>
          </div>
        </form>

        <aside className="rounded-lg border bg-white p-5">
          <h2 className="font-semibold">Message preview</h2>
          <div className="mt-5 rounded-lg border bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white">
                <BellRing className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{title.trim() || "Notification title"}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-gray-600">{body.trim() || "Your message will appear here."}</p>
                <p className="mt-3 text-xs text-gray-400">Boopi · now</p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-gray-500">
            Delivery uses the existing Supabase notifications table. Push delivery depends on the mobile app&apos;s current notification integration.
          </p>
        </aside>
      </section>

      <section className="rounded-lg border bg-white">
        <div className="border-b p-4">
          <h2 className="font-semibold">Recent deliveries</h2>
          <p className="mt-1 text-xs text-gray-500">Latest 100 customer notification rows.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Notification</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {notifications.map((notification) => (
                <tr key={notification.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs" title={notification.user_id}>{shortId(notification.user_id)}</td>
                  <td className="max-w-xl px-4 py-3">
                    <p className="font-medium">{notification.title}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-500">{notification.body}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-1 text-xs font-medium ${notification.is_read ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {notification.is_read ? "Read" : "Delivered"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(notification.created_at)}</td>
                </tr>
              ))}
              {!loading && notifications.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-500">No notifications sent yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
