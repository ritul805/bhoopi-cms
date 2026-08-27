"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Box,
  CaseSensitive,
  Grid3X3,
  Image as ImageIcon,
  LayoutTemplate,
  Plus,
  Sparkles,
  Trash2,
  Type,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

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

type TabKey = "colors" | "font" | "typography" | "presets";

const defaultForm = {
  token_key: "",
  token_value: "#6750a4",
  token_type: "color",
  group_name: "boopi",
  description: "",
  sort_order: "0",
  is_active: true,
};

const boopiColorSeeds = [
  ["Primary", "color.primary", "#6750A4", "Main Boopi action color."],
  ["On Primary", "color.on-primary", "#FFFFFF", "Text and icons on primary."],
  ["Primary Container", "color.primary-container", "#EADDFF", "Soft primary backgrounds."],
  ["On Primary Container", "color.on-primary-container", "#21005D", "Text on primary containers."],
  ["Secondary", "color.secondary", "#625B71", "Secondary actions and accents."],
  ["On Secondary", "color.on-secondary", "#FFFFFF", "Text and icons on secondary."],
  ["Secondary Container", "color.secondary-container", "#E8DEF8", "Soft secondary backgrounds."],
  ["On Secondary Container", "color.on-secondary-container", "#1D192B", "Text on secondary containers."],
  ["Surface", "color.surface", "#FFFBFE", "App and card surfaces."],
  ["On Surface", "color.on-surface", "#1C1B1F", "Primary text on surfaces."],
  ["Surface Variant", "color.surface-variant", "#E7E0EC", "Muted surface backgrounds."],
  ["On Surface Variant", "color.on-surface-variant", "#49454F", "Muted text on surfaces."],
  ["Outline", "color.outline", "#79747E", "Borders and separators."],
  ["Error", "color.error", "#B3261E", "Destructive and error states."],
  ["Home Top", "home.background.top", "#24325F", "Top of Boopi home gradient."],
  ["Home Middle", "home.background.middle", "#324582", "Middle of Boopi home gradient."],
  ["Home Bottom", "home.background.bottom", "#17234F", "Bottom of Boopi home gradient."],
  ["Player Primary", "player.background.primary", "#58AAF0", "Story player screen color."],
  ["Card Text", "home.card.text.primary", "#FFFFFF", "Text over story cards."],
] as const;

const typographyTokens = [
  ["Display Large", "57px", "1.12", "400"],
  ["Display Medium", "45px", "1.16", "400"],
  ["Display Small", "36px", "1.22", "400"],
  ["Headline Large", "32px", "1.25", "400"],
  ["Headline Medium", "28px", "1.29", "400"],
  ["Headline Small", "24px", "1.33", "400"],
  ["Title Large", "22px", "1.27", "500"],
  ["Title Medium", "16px", "1.50", "500"],
  ["Title Small", "14px", "1.43", "500"],
  ["Body Large", "16px", "1.50", "400"],
  ["Body Medium", "14px", "1.43", "400"],
  ["Body Small", "12px", "1.33", "400"],
  ["Label Large", "14px", "1.43", "500"],
  ["Label Medium", "12px", "1.33", "500"],
  ["Label Small", "11px", "1.45", "500"],
] as const;

const presetCategories = [
  ["All presets", Grid3X3],
  ["Text", Type],
  ["Container", Box],
  ["Image", ImageIcon],
  ["Button", Sparkles],
  ["Divider", CaseSensitive],
  ["Progress Bar", LayoutTemplate],
  ["Stories", Bookmark],
] as const;

function tokenName(tokenKey: string) {
  return tokenKey
    .replace(/^color\./, "")
    .replace(/^home\./, "home ")
    .replace(/^player\./, "player ")
    .split(/[.-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isHexColor(value: string) {
  return /^#[0-9a-f]{3,8}$/i.test(value.trim());
}

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("colors");
  const [tokens, setTokens] = useState<DesignToken[]>([]);
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const colorTokens = useMemo(
    () => tokens.filter((token) => token.token_type === "color"),
    [tokens]
  );

  const colorCards = useMemo(() => {
    const savedByKey = new Map(colorTokens.map((token) => [token.token_key, token]));
    return boopiColorSeeds.map(([name, key, value, description], index) => {
      const saved = savedByKey.get(key);
      return {
        id: saved?.id || key,
        name: tokenName(key) || name,
        token_key: key,
        token_value: saved?.token_value || value,
        description: saved?.description || description,
        sort_order: saved?.sort_order ?? index,
        is_active: saved?.is_active ?? true,
        savedToken: saved || null,
      };
    });
  }, [colorTokens]);

  const fetchTokens = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("design_tokens")
      .select("id, token_key, token_value, token_type, group_name, description, sort_order, is_active")
      .order("group_name", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("token_key", { ascending: true });

    if (error) {
      console.error("Error fetching design tokens:", error);
      alert("Could not load design tokens. Please run the design system SQL first.");
    } else {
      setTokens(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const resetForm = (tab: TabKey = activeTab) => {
    setEditingId(null);
    setFormData({
      ...defaultForm,
      token_type: tab === "font" ? "font" : tab === "typography" ? "typography" : "color",
      group_name: tab === "colors" ? "boopi" : tab,
      token_value: tab === "colors" ? "#6750a4" : "",
    });
  };

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    resetForm(tab);
  };

  const handleEdit = (token: DesignToken) => {
    setEditingId(token.id);
    setFormData({
      token_key: token.token_key,
      token_value: token.token_value,
      token_type: token.token_type,
      group_name: token.group_name || "boopi",
      description: token.description || "",
      sort_order: String(token.sort_order || 0),
      is_active: token.is_active,
    });
    setActiveTab(token.token_type === "font" ? "font" : token.token_type === "typography" ? "typography" : "colors");
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
      group_name: formData.group_name.trim() || "boopi",
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

  const saveSeedToken = async (seed: (typeof boopiColorSeeds)[number], index: number) => {
    setSaving(true);
    const [, key, value, description] = seed;
    const { error } = await supabase.from("design_tokens").insert([
      {
        token_key: key,
        token_value: value,
        token_type: "color",
        group_name: "boopi",
        description,
        sort_order: index,
        is_active: true,
      },
    ]);
    setSaving(false);
    if (error) {
      alert(`Could not create ${key}: ${error.message}`);
      return;
    }
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

  const tabs = [
    { key: "colors" as const, label: "Colors", count: colorCards.length },
    { key: "font" as const, label: "Font", count: "9 weights" },
    { key: "typography" as const, label: "Typography", count: typographyTokens.length },
    { key: "presets" as const, label: "Presets", count: tokens.filter((token) => token.token_type === "preset").length },
  ];

  return (
    <div className="-m-6 min-h-screen bg-[#fffdfa] text-[#1d1b2a]">
      <div className="border-b border-[#ebe7df] bg-white px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-[#77758a]">
          <span>Boopi</span>
          <span>/</span>
          <span className="font-semibold text-[#1d1b2a]">Design system</span>
        </div>
      </div>

      <div className="border-b border-[#ebe7df] bg-white px-6 pt-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Design system</h1>
            <p className="mt-2 text-base text-[#77758a]">
              Shared colors, type, font, and presets for Boopi app screens.
            </p>
          </div>
          <div className="rounded-full border border-[#e4dfd5] bg-[#faf8f3] px-5 py-3 text-sm text-[#77758a] shadow-sm">
            <span className="font-medium">Frame width</span>{" "}
            <span className="font-bold text-[#1d1b2a]">360px</span>
            <span className="ml-2">permanent</span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`border-b-4 px-1 pb-4 text-base font-semibold transition-colors ${
                activeTab === tab.key
                  ? "border-[#5146ff] text-[#1d1b2a]"
                  : "border-transparent text-[#77758a] hover:text-[#1d1b2a]"
              }`}
            >
              {tab.label}
              <span className="ml-2 rounded-full bg-[#f2f0eb] px-2 py-1 text-sm font-medium text-[#9a98a8]">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-8">
        {activeTab === "colors" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm text-[#77758a]">
                <span>Themes</span>
                <span className="rounded-full border border-[#e4dfd5] bg-white px-4 py-2 font-medium text-[#1d1b2a]">
                  Light
                </span>
              </div>
              <Button type="button" onClick={() => resetForm("colors")} className="gap-2 bg-[#5146ff] hover:bg-[#4338e8]">
                <Plus className="h-4 w-4" /> New color token
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border border-[#ebe7df] bg-white p-5 md:grid-cols-5">
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="token_key">Token key</Label>
                <Input
                  id="token_key"
                  placeholder="color.primary"
                  value={formData.token_key}
                  onChange={(event) => setFormData({ ...formData, token_key: event.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="token_value">Value</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={isHexColor(formData.token_value) ? formData.token_value : "#6750a4"}
                    onChange={(event) => setFormData({ ...formData, token_value: event.target.value })}
                    className="w-12 px-1"
                  />
                  <Input
                    id="token_value"
                    value={formData.token_value}
                    onChange={(event) => setFormData({ ...formData, token_value: event.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                />
              </div>
              <div className="flex items-end justify-end gap-2">
                {editingId && (
                  <Button type="button" variant="outline" onClick={() => resetForm("colors")}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Save" : "Create"}
                </Button>
              </div>
            </form>

            {loading ? (
              <div className="rounded-lg border border-[#ebe7df] bg-white p-10 text-center text-[#77758a]">
                Loading colors...
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {colorCards.map((token, index) => (
                  <div key={token.token_key} className="rounded-lg border border-[#ebe7df] bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold">{token.name}</h2>
                        <p className="mt-5 font-mono text-sm text-[#aaa6b6]">{token.token_key}</p>
                      </div>
                      {token.savedToken ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(token.savedToken!.id)}
                          className="rounded-md p-1 text-[#aaa6b6] hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${token.token_key}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => saveSeedToken(boopiColorSeeds[index], index)}
                          className="rounded-md p-1 text-[#5146ff] hover:bg-[#efedff]"
                          aria-label={`Create ${token.token_key}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="mt-5 text-sm text-[#77758a]">Light</p>
                    <button
                      type="button"
                      onClick={() => token.savedToken && handleEdit(token.savedToken)}
                      className="mt-2 grid h-12 w-full grid-cols-[56px_1fr_78px] overflow-hidden rounded-lg border border-[#ded9cf] bg-[#fffdfa] text-left"
                    >
                      <span className="flex items-center justify-center border-r border-[#ded9cf]">
                        <span className="h-7 w-7 rounded-md border border-[#ded9cf]" style={{ backgroundColor: token.token_value }} />
                      </span>
                      <span className="flex items-center px-4 font-mono text-sm uppercase">{token.token_value.replace("#", "")}</span>
                      <span className="flex items-center justify-center border-l border-[#ded9cf] text-sm text-[#77758a]">100%</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "font" && (
          <div className="grid gap-5">
            <p className="text-sm text-[#77758a]">
              Project font <span className="font-semibold text-[#1d1b2a]">Canva Sans</span>{" "}
              <span className="mx-2">/</span> weights 100, 200, 300, 400, 500, 600, 700, 800, 900
            </p>
            {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((weight) => (
              <div key={weight} className="rounded-lg border border-[#ebe7df] bg-white p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-[#77758a]">Weight {weight}</p>
                    <p className="mt-3 text-4xl" style={{ fontWeight: weight }}>
                      Boopi bedtime stories
                    </p>
                  </div>
                  <span className="font-mono text-sm text-[#77758a]">{weight}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "typography" && (
          <div className="grid gap-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-[#77758a]">
                Project font <span className="font-semibold text-[#1d1b2a]">Canva Sans</span>{" "}
                <span className="mx-2">/</span> Boopi mobile app type scale
              </p>
              <Button type="button" className="gap-2 bg-[#5146ff] hover:bg-[#4338e8]">
                <Plus className="h-4 w-4" /> New type token
              </Button>
            </div>
            {typographyTokens.map(([name, size, lineHeight, weight]) => (
              <div key={name} className="rounded-lg border border-[#ebe7df] bg-white p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-[#77758a]">{name}</p>
                    <p className="mt-2" style={{ fontSize: size, lineHeight, fontWeight: Number(weight) }}>
                      Keep the pace
                    </p>
                  </div>
                  <div className="font-mono text-sm text-[#77758a]">
                    {size} <span className="mx-2">/</span> {lineHeight} <span className="mx-2">/</span> {weight}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "presets" && (
          <div className="grid gap-6 lg:grid-cols-[370px_1fr]">
            <div className="rounded-lg border border-[#ebe7df] bg-white p-3">
              {presetCategories.map(([label, Icon], index) => (
                <button
                  key={label}
                  type="button"
                  className={`flex w-full items-center justify-between rounded-lg px-5 py-4 text-left text-sm font-medium ${
                    index === 0 ? "bg-[#ece9ff] text-[#5146ff]" : "text-[#77758a] hover:bg-[#faf8f3]"
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <Icon className="h-5 w-5" /> {label}
                  </span>
                  <span>0</span>
                </button>
              ))}
            </div>
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-[#ebe7df] bg-white p-8 text-center">
              <div className="rounded-lg bg-[#f5f3ef] p-5 text-[#aaa6b6]">
                <Bookmark className="h-8 w-8" />
              </div>
              <h2 className="mt-6 text-xl font-bold">No presets yet</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#77758a]">
                Create reusable styling for text, containers, images, buttons, and story components.
              </p>
              <Button type="button" className="mt-6 gap-2 bg-[#5146ff] hover:bg-[#4338e8]">
                <Plus className="h-4 w-4" /> New preset
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
