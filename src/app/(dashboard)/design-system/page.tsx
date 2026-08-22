"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Palette, Plus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DesignToken = {
  id: string;
  token_key: string;
  token_value: string;
  token_type: string;
  group_name: string | null;
  description: string | null;
  sort_order: number | null;
  is_active: boolean;
};

const defaultForm = {
  token_key: "",
  token_value: "#ffffff",
  token_type: "color",
  group_name: "home",
  description: "",
  sort_order: "0",
  is_active: true,
};

export default function DesignSystemPage() {
  const [tokens, setTokens] = useState<DesignToken[]>([]);
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const groupedTokens = useMemo(() => {
    return tokens.reduce<Record<string, DesignToken[]>>((groups, token) => {
      const group = token.group_name || "general";
      groups[group] = groups[group] || [];
      groups[group].push(token);
      return groups;
    }, {});
  }, [tokens]);

  const fetchTokens = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("design_tokens")
      .select(
        "id, token_key, token_value, token_type, group_name, description, sort_order, is_active"
      )
      .order("group_name", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("token_key", { ascending: true });

    if (error) {
      console.error("Error fetching design tokens:", error);
      alert(
        "Could not load design_tokens. Please run supabase_design_system_schema.sql first."
      );
    } else {
      setTokens(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const resetForm = () => {
    setFormData(defaultForm);
    setEditingId(null);
  };

  const handleEdit = (token: DesignToken) => {
    setEditingId(token.id);
    setFormData({
      token_key: token.token_key,
      token_value: token.token_value,
      token_type: token.token_type,
      group_name: token.group_name || "general",
      description: token.description || "",
      sort_order: String(token.sort_order || 0),
      is_active: token.is_active,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.token_key.trim() || !formData.token_value.trim()) {
      alert("Token key and value are required.");
      return;
    }

    setSaving(true);
    const payload = {
      token_key: formData.token_key.trim(),
      token_value: formData.token_value.trim(),
      token_type: formData.token_type.trim() || "color",
      group_name: formData.group_name.trim() || "general",
      description: formData.description.trim() || null,
      sort_order: Number(formData.sort_order || 0),
      is_active: formData.is_active,
    };

    const { error } = editingId
      ? await supabase.from("design_tokens").update(payload).eq("id", editingId)
      : await supabase.from("design_tokens").insert([payload]);

    setSaving(false);
    if (error) {
      console.error("Error saving design token:", error);
      alert(`Could not save design token: ${error.message}`);
      return;
    }

    resetForm();
    fetchTokens();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this design token?")) return;
    const { error } = await supabase.from("design_tokens").delete().eq("id", id);
    if (error) {
      alert(`Could not delete design token: ${error.message}`);
      return;
    }
    fetchTokens();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Design System</h1>
        <p className="text-sm text-muted-foreground">
          CMS-powered tokens for app colors and visual settings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-md border bg-white p-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
          {editingId ? (
            <Save className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {editingId ? "Edit Token" : "New Token"}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="token_key">Token Key</Label>
            <Input
              id="token_key"
              placeholder="home.background"
              value={formData.token_key}
              onChange={(event) =>
                setFormData({ ...formData, token_key: event.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="token_value">Value</Label>
            <div className="flex gap-2">
              {formData.token_type === "color" && (
                <Input
                  type="color"
                  value={formData.token_value}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      token_value: event.target.value,
                    })
                  }
                  className="w-12 px-1"
                />
              )}
              <Input
                id="token_value"
                placeholder="#24325f"
                value={formData.token_value}
                onChange={(event) =>
                  setFormData({ ...formData, token_value: event.target.value })
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="group_name">Group</Label>
            <Input
              id="group_name"
              placeholder="home"
              value={formData.group_name}
              onChange={(event) =>
                setFormData({ ...formData, group_name: event.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="token_type">Type</Label>
            <select
              id="token_type"
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={formData.token_type}
              onChange={(event) =>
                setFormData({ ...formData, token_type: event.target.value })
              }
            >
              <option value="color">Color</option>
              <option value="spacing">Spacing</option>
              <option value="radius">Radius</option>
              <option value="font">Font</option>
              <option value="asset">Asset</option>
            </select>
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Used for the home screen background"
              value={formData.description}
              onChange={(event) =>
                setFormData({ ...formData, description: event.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              type="number"
              value={formData.sort_order}
              onChange={(event) =>
                setFormData({ ...formData, sort_order: event.target.value })
              }
            />
          </div>

          <label className="flex items-end gap-2 pb-1 text-sm font-medium">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(event) =>
                setFormData({ ...formData, is_active: event.target.checked })
              }
            />
            Active
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Save Token" : "Create Token"}
          </Button>
        </div>
      </form>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Loading design tokens...
                </TableCell>
              </TableRow>
            ) : tokens.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  No design tokens found.
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(groupedTokens).flatMap(([group, groupTokens]) =>
                groupTokens.map((token, index) => (
                  <TableRow key={token.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {token.token_type === "color" ? (
                          <span
                            className="h-5 w-5 rounded border"
                            style={{ backgroundColor: token.token_value }}
                          />
                        ) : (
                          <Palette className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <div>{token.token_key}</div>
                          {token.description && (
                            <div className="text-xs font-normal text-muted-foreground">
                              {token.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{index === 0 ? group : ""}</TableCell>
                    <TableCell>{token.token_value}</TableCell>
                    <TableCell>{token.is_active ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(token)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(token.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
