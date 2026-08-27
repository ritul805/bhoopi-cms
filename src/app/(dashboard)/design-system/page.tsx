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
  X,
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

type DesignTokenPayload = {
  token_key: string;
  token_value: string;
  token_type: string;
  group_name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

type TabKey = "colors" | "typography" | "presets";

const defaultForm = {
  token_key: "",
  token_value: "#6750a4",
  token_type: "color",
  group_name: "boopi",
  description: "",
  sort_order: "0",
  is_active: true,
};

const defaultPresetValue = {
  background: "#ffffff",
  foreground: "#1d1b2a",
  track: "#e0e0e0",
  radius: "8",
  padding: "16",
  fillMode: "solid",
  trackMode: "solid",
  applicability: ["Nudge", "Guide"],
};

type PresetValueKey = "background" | "foreground" | "track" | "radius" | "padding" | "fillMode" | "trackMode";

const projectFontFamily = "Canva sans";

const fontWeights = [
  ["200", "Extra Light"],
  ["300", "Light"],
  ["400", "Regular"],
  ["500", "Medium"],
  ["600", "Semi Bold"],
  ["700", "Bold"],
  ["800", "Extra Bold"],
  ["900", "Heavy"],
] as const;

const defaultTypographyValue = {
  name: "",
  sample: "Keep the pace",
  size: "16",
  lineHeight: "1.5",
  letterSpacing: "0",
  weight: "400",
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

const typographySeeds = [
  ["Display Large", "typography.display-large", "57", "1.12", "-0.25", "400"],
  ["Display Medium", "typography.display-medium", "45", "1.16", "0", "400"],
  ["Display Small", "typography.display-small", "36", "1.22", "0", "400"],
  ["Headline Large", "typography.headline-large", "32", "1.25", "0", "400"],
  ["Headline Medium", "typography.headline-medium", "28", "1.29", "0", "400"],
  ["Headline Small", "typography.headline-small", "24", "1.33", "0", "400"],
  ["Title Large", "typography.title-large", "22", "1.27", "0", "500"],
  ["Title Medium", "typography.title-medium", "16", "1.5", "0.15", "500"],
  ["Title Small", "typography.title-small", "14", "1.43", "0.1", "500"],
  ["Body Large", "typography.body-large", "16", "1.5", "0.5", "400"],
  ["Body Medium", "typography.body-medium", "14", "1.43", "0.25", "400"],
  ["Body Small", "typography.body-small", "12", "1.33", "0.4", "400"],
  ["Label Large", "typography.label-large", "14", "1.43", "0.1", "500"],
  ["Label Medium", "typography.label-medium", "12", "1.33", "0.5", "500"],
  ["Label Small", "typography.label-small", "11", "1.45", "0.5", "500"],
] as const;

const presetCategories = [
  ["All presets", Grid3X3],
  ["Text", Type],
  ["Container", Box],
  ["Image", ImageIcon],
  ["Button", Sparkles],
  ["Divider", CaseSensitive],
  ["Progress Bar", LayoutTemplate],
  ["Lottie", Sparkles],
  ["Video", ImageIcon],
  ["Carousel", LayoutTemplate],
  ["Stories", Bookmark],
  ["Progress", LayoutTemplate],
  ["Close", X],
  ["Mute", Sparkles],
  ["Bottom sheet", LayoutTemplate],
  ["Dialog", Box],
  ["Tooltip", CaseSensitive],
] as const;

const presetSeeds = [
  [
    "Primary CTA",
    "preset.button.primary-cta",
    "Button",
    {
      ...defaultPresetValue,
      background: "#4945FF",
      foreground: "#FFFFFF",
      radius: "12",
      padding: "14",
      trackMode: "none",
    },
    "Primary action button preset.",
  ],
  [
    "Progress Bar",
    "preset.progress-bar.primary",
    "Progress Bar",
    {
      ...defaultPresetValue,
      foreground: "#4945FF",
      track: "#E0E0E0",
      radius: "4",
      padding: "0",
    },
    "Default Boopi progress bar preset.",
  ],
  [
    "Story Card",
    "preset.stories.card",
    "Stories",
    {
      ...defaultPresetValue,
      background: "#24325F",
      foreground: "#FFFFFF",
      radius: "16",
      padding: "16",
      trackMode: "none",
      applicability: ["Guide"],
    },
    "Story card container preset.",
  ],
  [
    "Dialog Surface",
    "preset.dialog.surface",
    "Dialog",
    {
      ...defaultPresetValue,
      background: "#FFFFFF",
      foreground: "#1D1B2A",
      radius: "20",
      padding: "20",
      trackMode: "none",
    },
    "Default modal dialog surface preset.",
  ],
  [
    "Tooltip Bubble",
    "preset.tooltip.bubble",
    "Tooltip",
    {
      ...defaultPresetValue,
      background: "#1D1B2A",
      foreground: "#FFFFFF",
      radius: "8",
      padding: "10",
      trackMode: "none",
      applicability: ["Nudge"],
    },
    "Compact tooltip preset.",
  ],
] as const;

const defaultDesignTokens: DesignTokenPayload[] = [
  ...boopiColorSeeds.map(([, key, value, description], index) => ({
    token_key: key,
    token_value: value,
    token_type: "color",
    group_name: "boopi",
    description,
    sort_order: index,
    is_active: true,
  })),
  ...typographySeeds.map(([name, key, size, lineHeight, letterSpacing, weight], index) => ({
    token_key: key,
    token_value: JSON.stringify({
      sample: "Keep the pace",
      size,
      lineHeight,
      letterSpacing,
      weight,
    }),
    token_type: "typography",
    group_name: "typography",
    description: `${name} type token for Boopi app screens.`,
    sort_order: index,
    is_active: true,
  })),
  ...presetSeeds.map(([, key, groupName, value, description], index) => ({
    token_key: key,
    token_value: JSON.stringify(value),
    token_type: "preset",
    group_name: groupName,
    description,
    sort_order: index,
    is_active: true,
  })),
];

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

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function presetKey(name: string, category: string) {
  return `preset.${slugify(category || "all")}.${slugify(name) || Date.now()}`;
}

function typographyKey(name: string) {
  return `typography.${slugify(name) || Date.now()}`;
}

function parseTypographyValue(value: string) {
  try {
    const parsed = JSON.parse(value);
    return {
      sample: parsed.sample || defaultTypographyValue.sample,
      size: String(parsed.size || defaultTypographyValue.size).replace("px", ""),
      lineHeight: String(parsed.lineHeight || defaultTypographyValue.lineHeight),
      letterSpacing: String(parsed.letterSpacing ?? defaultTypographyValue.letterSpacing).replace("px", ""),
      weight: String(parsed.weight || defaultTypographyValue.weight),
    };
  } catch {
    return {
      sample: defaultTypographyValue.sample,
      size: value.replace("px", "") || defaultTypographyValue.size,
      lineHeight: defaultTypographyValue.lineHeight,
      letterSpacing: defaultTypographyValue.letterSpacing,
      weight: defaultTypographyValue.weight,
    };
  }
}

function weightName(value: string) {
  return fontWeights.find(([weight]) => weight === value)?.[1] || value;
}

function parsePresetValue(value: string) {
  try {
    const parsed = JSON.parse(value);
    return {
      background: parsed.background || defaultPresetValue.background,
      foreground: parsed.foreground || defaultPresetValue.foreground,
      track: parsed.track || defaultPresetValue.track,
      radius: parsed.radius || defaultPresetValue.radius,
      padding: parsed.padding || defaultPresetValue.padding,
      fillMode: parsed.fillMode || defaultPresetValue.fillMode,
      trackMode: parsed.trackMode || defaultPresetValue.trackMode,
      applicability: Array.isArray(parsed.applicability) ? parsed.applicability : defaultPresetValue.applicability,
    };
  } catch {
    return defaultPresetValue;
  }
}

function presetNameFromKey(tokenKey: string) {
  return tokenName(tokenKey.replace(/^preset\.[^.]+\./, ""));
}

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("colors");
  const [tokens, setTokens] = useState<DesignToken[]>([]);
  const [formData, setFormData] = useState(defaultForm);
  const [typographyForm, setTypographyForm] = useState({
    ...defaultTypographyValue,
    description: "",
    sort_order: "0",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTypographyId, setEditingTypographyId] = useState<string | null>(null);
  const [editingTypographyKey, setEditingTypographyKey] = useState<string | null>(null);
  const [typographyModalOpen, setTypographyModalOpen] = useState(false);
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [selectedPresetCategory, setSelectedPresetCategory] = useState("All presets");
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

  const presetTokens = useMemo(
    () => tokens.filter((token) => token.token_type === "preset"),
    [tokens]
  );

  const savedTypographyTokens = useMemo(
    () => tokens.filter((token) => token.token_type === "typography"),
    [tokens]
  );

  const typographyCards = useMemo(() => {
    const defaultKeys = new Set<string>(typographySeeds.map(([, key]) => key));
    const savedByKey = new Map(savedTypographyTokens.map((token) => [token.token_key, token]));
    const defaults = typographySeeds.map(([name, key, size, lineHeight, letterSpacing, weight], index) => {
      const saved = savedByKey.get(key);
      const parsed = saved ? parseTypographyValue(saved.token_value) : { sample: "Keep the pace", size, lineHeight, letterSpacing, weight };
      return {
        id: saved?.id || key,
        name,
        token_key: key,
        description: saved?.description || "Boopi mobile app type token.",
        sort_order: saved?.sort_order ?? index,
        savedToken: saved || null,
        ...parsed,
      };
    });
    const custom = savedTypographyTokens
      .filter((token) => !defaultKeys.has(token.token_key))
      .map((token) => ({
        id: token.id,
        name: tokenName(token.token_key.replace(/^typography\./, "")),
        token_key: token.token_key,
        description: token.description || "",
        sort_order: token.sort_order ?? 99,
        savedToken: token,
        ...parseTypographyValue(token.token_value),
      }));
    return [...defaults, ...custom].sort((a, b) => a.sort_order - b.sort_order);
  }, [savedTypographyTokens]);

  const visiblePresetTokens = useMemo(() => {
    if (selectedPresetCategory === "All presets") return presetTokens;
    return presetTokens.filter((token) => token.group_name === selectedPresetCategory);
  }, [presetTokens, selectedPresetCategory]);

  const presetCounts = useMemo(() => {
    return presetTokens.reduce<Record<string, number>>(
      (counts, token) => {
        counts["All presets"] += 1;
        if (token.group_name) counts[token.group_name] = (counts[token.group_name] || 0) + 1;
        return counts;
      },
      { "All presets": 0 }
    );
  }, [presetTokens]);
  const currentPresetValue = useMemo(() => parsePresetValue(formData.token_value), [formData.token_value]);
  const isProgressPreset = formData.group_name === "Progress Bar";
  const presetFillField: PresetValueKey = isProgressPreset ? "foreground" : "background";
  const presetSecondaryField: PresetValueKey = isProgressPreset ? "track" : "foreground";
  const presetSecondaryLabel = isProgressPreset ? "Track" : "Content";

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
      const existingTokens = data || [];
      const existingKeys = new Set(existingTokens.map((token) => token.token_key));
      const missingDefaults = defaultDesignTokens.filter((token) => !existingKeys.has(token.token_key));

      if (missingDefaults.length > 0) {
        const { error: seedError } = await supabase
          .from("design_tokens")
          .upsert(missingDefaults, { onConflict: "token_key", ignoreDuplicates: true });

        if (seedError) {
          console.error("Error seeding default design tokens:", seedError);
          setTokens(existingTokens);
        } else {
          const { data: seededData, error: refetchError } = await supabase
            .from("design_tokens")
            .select("id, token_key, token_value, token_type, group_name, description, sort_order, is_active")
            .order("group_name", { ascending: true })
            .order("sort_order", { ascending: true })
            .order("token_key", { ascending: true });

          if (refetchError) {
            console.error("Error refetching seeded design tokens:", refetchError);
            setTokens(existingTokens);
          } else {
            setTokens(seededData || existingTokens);
          }
        }
      } else {
        setTokens(existingTokens);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const resetForm = (tab: TabKey = activeTab) => {
    setEditingId(null);
    if (tab === "presets") {
      const category = selectedPresetCategory === "All presets" ? "Text" : selectedPresetCategory;
      setFormData({
        ...defaultForm,
        token_key: "",
        token_type: "preset",
        group_name: category,
        description: "",
        token_value: JSON.stringify(defaultPresetValue),
      });
      return;
    }

    setFormData({
      ...defaultForm,
      token_type: tab === "typography" ? "typography" : "color",
      group_name: tab === "colors" ? "boopi" : tab,
      token_value: tab === "colors" ? "#6750a4" : "",
    });
  };

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    resetForm(tab);
    setEditingTypographyId(null);
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
    setActiveTab(
      token.token_type === "typography"
          ? "typography"
          : token.token_type === "preset"
            ? "presets"
            : "colors"
    );
    if (token.token_type === "preset" && token.group_name) {
      setSelectedPresetCategory(token.group_name);
      setPresetModalOpen(true);
    }
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

  const saveColorCard = async (
    token: {
      token_key: string;
      token_value: string;
      description: string | null;
      savedToken: DesignToken | null;
    },
    index: number,
    nextValue: string
  ) => {
    const normalizedValue = nextValue.trim().startsWith("#") ? nextValue.trim() : `#${nextValue.trim()}`;
    if (!isHexColor(normalizedValue)) {
      alert("Please enter a valid hex color.");
      return;
    }
    if (normalizedValue.toLowerCase() === token.token_value.toLowerCase()) return;

    setSaving(true);
    const payload = {
      token_key: token.token_key,
      token_value: normalizedValue.toUpperCase(),
      token_type: "color",
      group_name: "boopi",
      description: token.description || null,
      sort_order: index,
      is_active: true,
    };

    const { error } = token.savedToken
      ? await supabase.from("design_tokens").update(payload).eq("id", token.savedToken.id)
      : await supabase.from("design_tokens").insert([payload]);

    setSaving(false);
    if (error) {
      alert(`Could not save ${token.token_key}: ${error.message}`);
      return;
    }
    fetchTokens();
  };

  const resetTypographyForm = () => {
    setEditingTypographyId(null);
    setEditingTypographyKey(null);
    setTypographyForm({
      ...defaultTypographyValue,
      description: "",
      sort_order: "0",
    });
  };

  const openTypographyEditor = (token?: {
    name: string;
    token_key: string;
    sample: string;
    size: string;
    lineHeight: string;
    letterSpacing: string;
    weight: string;
    description: string | null;
    sort_order: number | null;
    savedToken: DesignToken | null;
  }) => {
    if (!token) {
      resetTypographyForm();
      setTypographyModalOpen(true);
      return;
    }

    setEditingTypographyId(token.savedToken?.id || null);
    setEditingTypographyKey(token.token_key);
    setTypographyForm({
      name: token.name,
      sample: token.sample,
      size: token.size,
      lineHeight: token.lineHeight,
      letterSpacing: token.letterSpacing,
      weight: token.weight,
      description: token.description || "",
      sort_order: String(token.sort_order || 0),
    });
    setTypographyModalOpen(true);
  };

  const handleTypographySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!typographyForm.name.trim()) {
      alert("Type token name is required.");
      return;
    }

    setSaving(true);
    const existingToken = editingTypographyId ? savedTypographyTokens.find((token) => token.id === editingTypographyId) : null;
    const payload = {
      token_key: existingToken?.token_key || editingTypographyKey || typographyKey(typographyForm.name),
      token_value: JSON.stringify({
        sample: typographyForm.sample || defaultTypographyValue.sample,
        size: typographyForm.size,
        lineHeight: typographyForm.lineHeight,
        letterSpacing: typographyForm.letterSpacing,
        weight: typographyForm.weight,
      }),
      token_type: "typography",
      group_name: "typography",
      description: typographyForm.description.trim() || null,
      sort_order: Number(typographyForm.sort_order || 0),
      is_active: true,
    };

    const { error } = editingTypographyId
      ? await supabase.from("design_tokens").update(payload).eq("id", editingTypographyId)
      : await supabase.from("design_tokens").insert([payload]);

    setSaving(false);
    if (error) {
      alert(`Could not save type token: ${error.message}`);
      return;
    }

    resetTypographyForm();
    setTypographyModalOpen(false);
    fetchTokens();
  };

  const saveTypographySeed = async (seed: (typeof typographySeeds)[number], index: number) => {
    const [name, key, size, lineHeight, letterSpacing, weight] = seed;
    setSaving(true);
    const { error } = await supabase.from("design_tokens").insert([
      {
        token_key: key,
        token_value: JSON.stringify({
          sample: "Keep the pace",
          size,
          lineHeight,
          letterSpacing,
          weight,
        }),
        token_type: "typography",
        group_name: "typography",
        description: `${name} type token for Boopi app screens.`,
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

  const handlePresetSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const presetName = formData.token_key.trim();
    if (!presetName) {
      alert("Preset name is required.");
      return;
    }

    setSaving(true);
    const payload = {
      token_key: editingId && formData.token_key.startsWith("preset.")
        ? formData.token_key
        : presetKey(presetName, formData.group_name),
      token_value: formData.token_value,
      token_type: "preset",
      group_name: formData.group_name || "Text",
      description: formData.description.trim() || null,
      sort_order: Number(formData.sort_order || 0),
      is_active: formData.is_active,
    };

    const { error } = editingId
      ? await supabase.from("design_tokens").update(payload).eq("id", editingId)
      : await supabase.from("design_tokens").insert([payload]);

    setSaving(false);
    if (error) {
      alert(`Could not save preset: ${error.message}`);
      return;
    }

    resetForm("presets");
    setPresetModalOpen(false);
    fetchTokens();
  };

  const updatePresetValue = (field: PresetValueKey, value: string) => {
    const parsed = parsePresetValue(formData.token_value);
    setFormData({
      ...formData,
      token_value: JSON.stringify({ ...parsed, [field]: value }),
    });
  };

  const togglePresetApplicability = (value: string) => {
    const parsed = parsePresetValue(formData.token_value);
    const applicability = parsed.applicability.includes(value)
      ? parsed.applicability.filter((item: string) => item !== value)
      : [...parsed.applicability, value];
    setFormData({
      ...formData,
      token_value: JSON.stringify({ ...parsed, applicability }),
    });
  };

  const openPresetEditor = (preset?: DesignToken, category = selectedPresetCategory) => {
    if (preset) {
      handleEdit(preset);
      setPresetModalOpen(true);
      return;
    }

    const nextCategory = category === "All presets" ? "Progress Bar" : category;
    setEditingId(null);
    setFormData({
      ...defaultForm,
      token_key: "",
      token_type: "preset",
      group_name: nextCategory,
      description: "",
      token_value: JSON.stringify(defaultPresetValue),
    });
    setPresetModalOpen(true);
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
    { key: "typography" as const, label: "Typography", count: typographyCards.length },
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
              Shared colors, type, and presets for Boopi app screens.
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

            <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border border-[#ebe7df] bg-white p-5 md:grid-cols-[2fr_1fr_1fr_auto]">
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
                    <div className="mt-2 grid h-12 w-full grid-cols-[56px_1fr_78px] overflow-hidden rounded-lg border border-[#ded9cf] bg-[#fffdfa] text-left">
                      <span className="flex items-center justify-center border-r border-[#ded9cf]">
                        <input
                          key={`${token.token_key}-picker-${token.token_value}`}
                          type="color"
                          defaultValue={isHexColor(token.token_value) ? token.token_value : "#6750A4"}
                          onChange={(event) => saveColorCard(token, index, event.target.value)}
                          className="h-7 w-7 cursor-pointer rounded-md border border-[#ded9cf] bg-transparent p-0"
                          aria-label={`Edit ${token.token_key} color`}
                        />
                      </span>
                      <input
                        key={`${token.token_key}-hex-${token.token_value}`}
                        defaultValue={token.token_value.replace("#", "").toUpperCase()}
                        onFocus={() => {
                          if (token.savedToken) {
                            handleEdit(token.savedToken);
                            return;
                          }
                          setEditingId(null);
                          setFormData({
                            token_key: token.token_key,
                            token_value: token.token_value,
                            token_type: "color",
                            group_name: "boopi",
                            description: token.description || "",
                            sort_order: String(token.sort_order || 0),
                            is_active: true,
                          });
                        }}
                        onBlur={(event) => saveColorCard(token, index, event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.currentTarget.blur();
                          }
                        }}
                        className="min-w-0 bg-transparent px-4 font-mono text-sm uppercase outline-none focus:bg-white"
                        aria-label={`Edit ${token.token_key} hex value`}
                      />
                      <span className="flex items-center justify-center border-l border-[#ded9cf] text-sm text-[#77758a]">100%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "typography" && (
          <div className="grid gap-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-[#77758a]">
                Project font <span className="font-semibold text-[#1d1b2a]">{projectFontFamily}</span>{" "}
                <span className="mx-2">/</span> weights 200, 300, 400, 500, 600, 700, 800, 900
              </p>
              <Button type="button" onClick={() => openTypographyEditor()} className="gap-2 bg-[#5146ff] hover:bg-[#4338e8]">
                <Plus className="h-4 w-4" /> New type token
              </Button>
            </div>

            {typographyCards.map((token, index) => (
              <div
                key={token.token_key}
                onClick={() => openTypographyEditor(token)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openTypographyEditor(token);
                  }
                }}
                className="rounded-lg border border-[#ebe7df] bg-white p-6 text-left transition-colors hover:border-[#d8d1c7]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-[#77758a]">{token.name}</p>
                    <p
                      className="mt-2"
                      style={{
                        fontFamily: projectFontFamily,
                        fontSize: `${token.size}px`,
                        lineHeight: token.lineHeight,
                        letterSpacing: `${token.letterSpacing}px`,
                        fontWeight: Number(token.weight),
                      }}
                    >
                      {token.sample}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-sm text-[#77758a]">
                      {token.size}px <span className="mx-2">/</span> {token.lineHeight} <span className="mx-2">/</span> {token.weight}
                    </div>
                    {token.savedToken ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(token.savedToken!.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={saving}
                        onClick={(event) => {
                          event.stopPropagation();
                          saveTypographySeed(typographySeeds[index], index);
                        }}
                      >
                        Save
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {typographyModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
                <form onSubmit={handleTypographySubmit} className="w-full max-w-[740px] rounded-2xl border border-[#ebe7df] bg-white p-8 shadow-2xl">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <h2 className="text-2xl font-bold">Edit typography token</h2>
                      <p className="mt-3 text-sm text-[#77758a]">Uses the project font, {projectFontFamily}.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        resetTypographyForm();
                        setTypographyModalOpen(false);
                      }}
                      className="rounded-md p-1 text-[#9a98a8] hover:bg-[#f5f3ef]"
                      aria-label="Close typography editor"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-6 grid gap-2">
                    <Label htmlFor="type_name">Name</Label>
                    <Input
                      id="type_name"
                      value={typographyForm.name}
                      onChange={(event) => setTypographyForm({ ...typographyForm, name: event.target.value })}
                    />
                    <p className="font-mono text-sm text-[#aaa6b6]">
                      {editingTypographyKey || typographyKey(typographyForm.name || "new-token")}
                    </p>
                  </div>

                  <div className="mt-6 rounded-lg border border-[#ebe7df] bg-[#fffdfa] p-8 text-center">
                    <p
                      style={{
                        fontFamily: projectFontFamily,
                        fontSize: `${typographyForm.size || 16}px`,
                        lineHeight: typographyForm.lineHeight || 1.5,
                        letterSpacing: `${typographyForm.letterSpacing || 0}px`,
                        fontWeight: Number(typographyForm.weight || 400),
                      }}
                    >
                      {typographyForm.sample || "Keep the pace"}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="type_size">Size</Label>
                      <div className="relative">
                        <Input
                          id="type_size"
                          type="number"
                          value={typographyForm.size}
                          onChange={(event) => setTypographyForm({ ...typographyForm, size: event.target.value })}
                          className="pr-10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#aaa6b6]">px</span>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type_line_height">Line height</Label>
                      <Input
                        id="type_line_height"
                        value={typographyForm.lineHeight}
                        onChange={(event) => setTypographyForm({ ...typographyForm, lineHeight: event.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type_letter_spacing">Letter spacing</Label>
                      <div className="relative">
                        <Input
                          id="type_letter_spacing"
                          type="number"
                          step="0.01"
                          value={typographyForm.letterSpacing}
                          onChange={(event) => setTypographyForm({ ...typographyForm, letterSpacing: event.target.value })}
                          className="pr-10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#aaa6b6]">px</span>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type_weight">Weight</Label>
                      <select
                        id="type_weight"
                        className="h-10 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        value={typographyForm.weight}
                        onChange={(event) => setTypographyForm({ ...typographyForm, weight: event.target.value })}
                      >
                        {fontWeights.map(([weight, label]) => (
                          <option key={weight} value={weight}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <Label htmlFor="type_sample">Sample text</Label>
                    <Input
                      id="type_sample"
                      value={typographyForm.sample}
                      onChange={(event) => setTypographyForm({ ...typographyForm, sample: event.target.value })}
                    />
                  </div>

                  <p className="mt-4 text-sm text-[#aaa6b6]">Weights come from the project font settings.</p>

                  <div className="mt-6 flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetTypographyForm();
                        setTypographyModalOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="bg-[#5146ff] hover:bg-[#4338e8]">
                      {saving ? "Saving..." : "Save changes"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === "presets" && (
          <div className="grid gap-6 lg:grid-cols-[370px_1fr]">
            <div className="rounded-lg border border-[#ebe7df] bg-white p-3">
              {presetCategories.map(([label, Icon]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedPresetCategory(label)}
                  className={`flex w-full items-center justify-between rounded-lg px-5 py-4 text-left text-sm font-medium ${
                    selectedPresetCategory === label ? "bg-[#ece9ff] text-[#5146ff]" : "text-[#77758a] hover:bg-[#faf8f3]"
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <Icon className="h-5 w-5" /> {label}
                  </span>
                  <span>{presetCounts[label] || 0}</span>
                </button>
              ))}
            </div>
            <div className="grid gap-5">
              <div className="flex justify-end">
                <Button type="button" onClick={() => openPresetEditor()} className="gap-2 bg-[#5146ff] hover:bg-[#4338e8]">
                  <Plus className="h-4 w-4" /> New preset
                </Button>
              </div>

              {visiblePresetTokens.length === 0 ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-[#ebe7df] bg-white p-8 text-center">
                  <div className="rounded-lg bg-[#f5f3ef] p-5 text-[#aaa6b6]">
                    <Bookmark className="h-8 w-8" />
                  </div>
                  <h2 className="mt-6 text-xl font-bold">No presets yet</h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-[#77758a]">
                    Create reusable styling for text, containers, images, buttons, and story components.
                  </p>
                  <Button type="button" onClick={() => openPresetEditor()} className="mt-6 gap-2 bg-[#5146ff] hover:bg-[#4338e8]">
                    <Plus className="h-4 w-4" /> New preset
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {visiblePresetTokens.map((preset) => {
                    const value = parsePresetValue(preset.token_value);
                    const isProgress = preset.group_name === "Progress Bar";
                    return (
                      <div key={preset.id} className="rounded-lg border border-[#ebe7df] bg-white p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">{presetNameFromKey(preset.token_key)}</h3>
                            <p className="mt-1 text-sm text-[#77758a]">{preset.group_name}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => openPresetEditor(preset)}>
                              Edit
                            </Button>
                            <Button type="button" variant="outline" size="icon" onClick={() => handleDelete(preset.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-5 rounded-lg border border-[#ded9cf] bg-[#fffdfa] p-5">
                          {isProgress ? (
                            <div
                              className="h-4 w-40 overflow-hidden rounded-sm"
                              style={{ backgroundColor: value.track, borderRadius: `${value.radius}px` }}
                            >
                              <div
                                className="h-full w-2/3"
                                style={{ backgroundColor: value.foreground, borderRadius: `${value.radius}px` }}
                              />
                            </div>
                          ) : (
                            <div
                              className="inline-flex min-h-12 min-w-32 items-center justify-center border border-[#ded9cf] text-sm font-medium"
                              style={{
                                backgroundColor: value.background,
                                color: value.foreground,
                                borderRadius: `${value.radius}px`,
                                padding: `${value.padding}px`,
                              }}
                            >
                              {preset.group_name}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {presetModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-5">
                <form onSubmit={handlePresetSubmit} className="flex h-[82vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-2xl border border-[#ebe7df] bg-white shadow-2xl">
                  <div className="flex items-start justify-between border-b border-[#ebe7df] px-8 py-5">
                    <div>
                      <h2 className="text-2xl font-bold">{editingId ? "Edit preset" : "New preset"}</h2>
                      <p className="mt-1 text-sm text-[#77758a]">Create reusable styling for a canvas element.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        resetForm("presets");
                        setPresetModalOpen(false);
                      }}
                      className="rounded-md p-1 text-[#9a98a8] hover:bg-[#f5f3ef]"
                      aria-label="Close preset editor"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid min-h-0 flex-1 grid-cols-[260px_1fr_360px]">
                    <div className="overflow-y-auto border-r border-[#ebe7df] p-4">
                      <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.12em] text-[#aaa6b6]">Element type</p>
                      {presetCategories.slice(1).map(([label, Icon]) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setFormData({ ...formData, group_name: label })}
                          className={`mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium ${
                            formData.group_name === label ? "bg-[#5146ff] text-white ring-2 ring-[#7b72ff]" : "text-[#77758a] hover:bg-[#faf8f3]"
                          }`}
                        >
                          <Icon className="h-5 w-5" /> {label}
                        </button>
                      ))}
                    </div>

                    <div className="grid min-h-0 grid-rows-[auto_1fr]">
                      <div className="grid gap-4 border-b border-[#ebe7df] px-6 py-5 md:grid-cols-[1fr_auto]">
                        <div className="grid gap-2">
                          <Label htmlFor="preset_name">Preset name</Label>
                          <Input
                            id="preset_name"
                            placeholder="e.g. Primary CTA"
                            value={formData.token_key.startsWith("preset.") ? presetNameFromKey(formData.token_key) : formData.token_key}
                            onChange={(event) => setFormData({ ...formData, token_key: event.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Applicability</Label>
                          <div className="mt-3 flex gap-4 text-sm text-[#77758a]">
                            {["Nudge", "Guide"].map((item) => (
                              <label key={item} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={currentPresetValue.applicability.includes(item)}
                                  onChange={() => togglePresetApplicability(item)}
                                />
                                {item}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex min-h-0 items-center justify-center bg-[#f7f6f2] p-8">
                        <div className="flex h-[430px] w-[260px] items-center justify-center rounded-lg border border-[#ebe7df] bg-white shadow-sm">
                          {formData.group_name === "Progress Bar" ? (
                            <div
                              className="h-5 w-40 overflow-hidden"
                              style={{
                                backgroundColor: currentPresetValue.track,
                                borderRadius: `${currentPresetValue.radius}px`,
                              }}
                            >
                              <div
                                className="h-full w-2/3"
                                style={{
                                  backgroundColor: currentPresetValue.foreground,
                                  borderRadius: `${currentPresetValue.radius}px`,
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className="min-h-20 w-44 border border-[#ded9cf] text-center text-sm"
                              style={{
                                backgroundColor: currentPresetValue.background,
                                color: currentPresetValue.foreground,
                                borderRadius: `${currentPresetValue.radius}px`,
                                padding: `${currentPresetValue.padding}px`,
                              }}
                            >
                              {formData.group_name || "Boopi preset"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="overflow-y-auto border-l border-[#ebe7df] bg-white">
                      <div className="border-b border-[#ebe7df] p-6">
                        <p className="mb-5 text-xs font-bold uppercase tracking-[0.12em] text-[#aaa6b6]">Style</p>

                        <Label>Fill</Label>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {["solid", "gradient", "none"].map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => updatePresetValue("fillMode", mode)}
                              className={`rounded-lg border px-3 py-3 text-sm capitalize ${
                                parsePresetValue(formData.token_value).fillMode === mode
                                  ? "border-[#5146ff] bg-[#ece9ff] text-[#5146ff]"
                                  : "border-[#ebe7df] text-[#1d1b2a]"
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>

                        <Label htmlFor="preset_fill_color" className="mt-5 block">Color</Label>
                        <div className="mt-2 flex overflow-hidden rounded-lg border border-[#ded9cf]">
                          <Input
                            id="preset_fill_color"
                            type="color"
                            value={isHexColor(currentPresetValue[presetFillField]) ? currentPresetValue[presetFillField] : "#000000"}
                            onChange={(event) => updatePresetValue(presetFillField, event.target.value)}
                            className="h-12 w-14 rounded-none border-0 px-2"
                          />
                          <Input
                            value={currentPresetValue[presetFillField].replace("#", "").toUpperCase()}
                            onChange={(event) => updatePresetValue(presetFillField, `#${event.target.value}`)}
                            className="h-12 rounded-none border-0 font-mono uppercase"
                          />
                        </div>

                        <Label className="mt-6 block">{presetSecondaryLabel}</Label>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {["solid", "gradient", "none"].map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => updatePresetValue("trackMode", mode)}
                              className={`rounded-lg border px-3 py-3 text-sm capitalize ${
                                parsePresetValue(formData.token_value).trackMode === mode
                                  ? "border-[#5146ff] bg-[#ece9ff] text-[#5146ff]"
                                  : "border-[#ebe7df] text-[#1d1b2a]"
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>

                        <Label htmlFor="preset_secondary_color" className="mt-5 block">Color</Label>
                        <div className="mt-2 flex overflow-hidden rounded-lg border border-[#ded9cf]">
                          <Input
                            id="preset_secondary_color"
                            type="color"
                            value={isHexColor(currentPresetValue[presetSecondaryField]) ? currentPresetValue[presetSecondaryField] : "#000000"}
                            onChange={(event) => updatePresetValue(presetSecondaryField, event.target.value)}
                            className="h-12 w-14 rounded-none border-0 px-2"
                          />
                          <Input
                            value={currentPresetValue[presetSecondaryField].replace("#", "").toUpperCase()}
                            onChange={(event) => updatePresetValue(presetSecondaryField, `#${event.target.value}`)}
                            className="h-12 rounded-none border-0 font-mono uppercase"
                          />
                        </div>

                        <Label htmlFor="preset_radius" className="mt-6 block">Corner radius (px)</Label>
                        <div className="relative mt-2">
                          <Input
                            id="preset_radius"
                            type="number"
                            value={currentPresetValue.radius}
                            onChange={(event) => updatePresetValue("radius", event.target.value)}
                            className="pr-10"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#aaa6b6]">px</span>
                        </div>

                        <Label htmlFor="preset_padding" className="mt-6 block">Padding (px)</Label>
                        <Input
                          id="preset_padding"
                          type="number"
                          value={currentPresetValue.padding}
                          onChange={(event) => updatePresetValue("padding", event.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-[#ebe7df] px-8 py-5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetForm("presets");
                        setPresetModalOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="gap-2 bg-[#5146ff] hover:bg-[#4338e8]">
                      <Plus className="h-4 w-4" /> {saving ? "Saving..." : editingId ? "Save preset" : "Create preset"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
