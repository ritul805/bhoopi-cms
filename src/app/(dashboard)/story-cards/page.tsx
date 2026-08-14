"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function StoryCardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("story_cards")
      .select("id, title, thumbnail_url, hero_banner_url, category, sort_order, is_active, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching story cards:", error);
      alert("Could not load story_cards. Please confirm the story_cards table exists.");
    } else {
      setCards(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this story card? Child stories may also be affected depending on database constraints.")) return;
    await supabase.from("story_cards").delete().eq("id", id);
    fetchCards();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Story Cards</h1>
          <p className="text-sm text-muted-foreground">Parent cards shown on Home.</p>
        </div>
        <Link href="/story-cards/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Story Card
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Card</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Sort</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Loading story cards...
                </TableCell>
              </TableRow>
            ) : cards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No story cards found.
                </TableCell>
              </TableRow>
            ) : (
              cards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {card.thumbnail_url ? (
                        <img
                          src={card.thumbnail_url}
                          alt={card.title}
                          className="h-10 w-10 flex-shrink-0 rounded-md border object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border bg-gray-100 text-gray-400">
                          <BookOpen className="h-4 w-4" />
                        </div>
                      )}
                      {card.title}
                    </div>
                  </TableCell>
                  <TableCell>{card.category || "-"}</TableCell>
                  <TableCell>{card.sort_order || 0}</TableCell>
                  <TableCell>{card.is_active ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="icon" onClick={() => handleDelete(card.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
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
