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

import {
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";

import Link from "next/link";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("story_categories")
      .select("*")
      .order("title", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
    }

    if (!error && data) {
      setCategories(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("story_categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);

      alert(
        "Error deleting category: " + error.message
      );

      return;
    }

    fetchCategories();
  };

  return (
    <div className="flex flex-col gap-6">

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">

        <h1 className="text-3xl font-bold tracking-tight">
          Categories
        </h1>

        <Link href="/categories/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Category
          </Button>
        </Link>

      </div>

      {/* TABLE */}
      <div className="rounded-md border bg-white">

        <Table>

          <TableHeader>
            <TableRow>

              <TableHead>
                Title
              </TableHead>

              <TableHead>
                Theme Color
              </TableHead>

              <TableHead className="text-right">
                Actions
              </TableHead>

            </TableRow>
          </TableHeader>

          <TableBody>

            {/* LOADING */}
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading categories...
                </TableCell>
              </TableRow>
            )}

            {/* EMPTY */}
            {!loading && categories.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-8 text-muted-foreground"
                >
                  No categories found.
                </TableCell>
              </TableRow>
            )}

            {/* CATEGORIES */}
            {!loading &&
              categories.map((category) => (
                <TableRow key={category.id}>

                  {/* TITLE */}
                  <TableCell className="font-medium">
                    {category.title}
                  </TableCell>

                  {/* THEME COLOR */}
                  <TableCell>
                    <div className="flex items-center gap-2">

                      {category.theme_color && (
                        <div
                          className="h-4 w-4 rounded-full border"
                          style={{
                            backgroundColor:
                              category.theme_color,
                          }}
                        />
                      )}

                      <span>
                        {category.theme_color || "None"}
                      </span>

                    </div>
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell className="text-right">

                    <div className="flex justify-end gap-2">

                      {/* EDIT */}
                      <Link
                        href={`/categories/${category.id}/edit`}
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          title="Edit Category"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>

                      {/* DELETE */}
                      <Button
                        variant="outline"
                        size="icon"
                        title="Delete Category"
                        onClick={() =>
                          handleDelete(category.id)
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>

                    </div>

                  </TableCell>

                </TableRow>
              ))}

          </TableBody>

        </Table>

      </div>

    </div>
  );
}