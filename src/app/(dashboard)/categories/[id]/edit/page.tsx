"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();

  const categoryId = params.id as string;

  const [title, setTitle] = useState("");
  const [themeColor, setThemeColor] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =========================
     FETCH CATEGORY
  ========================= */

  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) {
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("story_categories")
        .select("*")
        .eq("id", categoryId)
        .single();

      if (error) {
        console.error(
          "Error fetching category:",
          error
        );

        alert("Unable to load category.");

        router.push("/categories");

        return;
      }

      setTitle(data.title || "");
      setThemeColor(data.theme_color || "");

      setLoading(false);
    };

    fetchCategory();
  }, [categoryId, router]);

  /* =========================
     UPDATE CATEGORY
  ========================= */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a category title.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("story_categories")
      .update({
        title: title.trim(),
        theme_color:
          themeColor.trim() || null,
      })
      .eq("id", categoryId);

    if (error) {
      console.error(
        "Error updating category:",
        error
      );

      alert(
        "Error updating category: " +
          error.message
      );

      setSaving(false);

      return;
    }

    router.push("/categories");
    router.refresh();
  };

  /* =========================
     LOADING STATE
  ========================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">

        <p className="text-muted-foreground">
          Loading category...
        </p>

      </div>
    );
  }

  /* =========================
     EDIT FORM
  ========================= */

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* HEADER */}
      <div>

        <h1 className="text-3xl font-bold tracking-tight">
          Edit Category
        </h1>

        <p className="text-muted-foreground mt-1">
          Update the category details below.
        </p>

      </div>

      {/* CARD */}
      <Card>

        <CardHeader>

          <CardTitle>
            Category Details
          </CardTitle>

        </CardHeader>

        <CardContent>

          <form
            onSubmit={handleSubmit}
            className="grid gap-6"
          >

            {/* TITLE */}
            <div className="grid gap-2">

              <Label htmlFor="title">
                Title
              </Label>

              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Enter category title"
                required
              />

            </div>

            {/* THEME COLOR */}
            <div className="grid gap-2">

              <Label htmlFor="theme_color">
                Theme Color
              </Label>

              <div className="flex items-center gap-3">

                <Input
                  id="theme_color"
                  type="text"
                  value={themeColor}
                  onChange={(e) =>
                    setThemeColor(e.target.value)
                  }
                  placeholder="#FF5733"
                />

                {/* COLOR PREVIEW */}
                {themeColor && (
                  <div
                    className="h-10 w-10 rounded-md border shrink-0"
                    style={{
                      backgroundColor:
                        themeColor,
                    }}
                  />
                )}

              </div>

              <p className="text-xs text-muted-foreground">
                Enter a color such as #FF5733.
              </p>

            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-3 pt-2">

              {/* CANCEL */}
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() =>
                  router.push("/categories")
                }
              >
                Cancel
              </Button>

              {/* UPDATE */}
              <Button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Updating..."
                  : "Update Category"}
              </Button>

            </div>

          </form>

        </CardContent>

      </Card>

    </div>
  );
}