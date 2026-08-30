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
  theme: string | null;
  description: string | null;
  sort_order: number | null;
  is_active: boolean;
};

type DesignTokenPayload = {
  token_key: string;
  token_value: string;
  token_type: string;
  group_name: string;
  theme: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

type TabKey = "colors" | "typography" | "presets";
type ThemeKey = "light" | "dark";

const defaultForm = {
  token_key: "",
  token_value: "#6750a4",
  token_type: "color",
  group_name: "boopi",
  theme: "light",
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

const boopiDarkColorSeeds = [
  ["Primary", "color.primary", "#D0BCFF", "Main Boopi action color in dark theme."],
  ["On Primary", "color.on-primary", "#381E72", "Text and icons on dark primary."],
  ["Primary Container", "color.primary-container", "#4F378B", "Dark primary container backgrounds."],
  ["On Primary Container", "color.on-primary-container", "#EADDFF", "Text on dark primary containers."],
  ["Secondary", "color.secondary", "#CCC2DC", "Secondary dark actions and accents."],
  ["On Secondary", "color.on-secondary", "#332D41", "Text and icons on dark secondary."],
  ["Secondary Container", "color.secondary-container", "#4A4458", "Dark secondary container backgrounds."],
  ["On Secondary Container", "color.on-secondary-container", "#E8DEF8", "Text on dark secondary containers."],
  ["Surface", "color.surface", "#141218", "Dark app and card surfaces."],
  ["On Surface", "color.on-surface", "#E6E0E9", "Primary text on dark surfaces."],
  ["Surface Variant", "color.surface-variant", "#49454F", "Muted dark surface backgrounds."],
  ["On Surface Variant", "color.on-surface-variant", "#CAC4D0", "Muted text on dark surfaces."],
  ["Outline", "color.outline", "#938F99", "Dark borders and separators."],
  ["Error", "color.error", "#F2B8B5", "Dark destructive and error states."],
  ["Home Top", "home.background.top", "#111827", "Top of Boopi dark home gradient."],
  ["Home Middle", "home.background.middle", "#1F2A44", "Middle of Boopi dark home gradient."],
  ["Home Bottom", "home.background.bottom", "#080D1F", "Bottom of Boopi dark home gradient."],
  ["Player Primary", "player.background.primary", "#2F80ED", "Dark story player screen color."],
  ["Card Text", "home.card.text.primary", "#FFFFFF", "Text over dark story cards."],
] as const;

type SemanticColorSeed = readonly [name: string, key: string, light: string, dark: string, description: string];

const semanticColorSeeds: readonly SemanticColorSeed[] = [
  ["Profile Text Primary", "profile.text.primary", "#FFFFFF", "#FFFFFF", "Primary Profile foreground."],
  ["Profile Text Secondary", "profile.text.secondary", "#BFC5D8", "#BFC5D8", "Secondary Profile foreground."],
  ["Profile Card Background", "profile.card.background", "#3E4A70", "#2B344C", "Profile glass card background fallback."],
  ["Profile Card Border", "profile.card.border", "#586489", "#50576B", "Profile glass card border fallback."],
  ["Profile Row Divider", "profile.row.divider", "#485477", "#3A435A", "Profile row divider fallback."],
  ["Profile Icon Background", "profile.icon.background", "#394568", "#293249", "Profile icon bubble background fallback."],
  ["Profile Switch Track", "profile.switch.track", "#586489", "#50576B", "Profile switch track fallback."],
  ["Profile Switch Thumb Active", "profile.switch.thumb.active", "#FFFFFF", "#FFFFFF", "Active Profile switch thumb."],
  ["Profile Loading Placeholder", "profile.loading.placeholder", "#445174", "#343E55", "Profile loading placeholder fallback."],
  ["Onboarding Control Background", "onboarding.control.background", "#3E4A70", "#2B344C", "Onboarding glass control background fallback."],
  ["Onboarding Control Border", "onboarding.control.border", "#586489", "#50576B", "Onboarding control border fallback."],
  ["Onboarding Choice Background", "onboarding.choice.background", "#3E4A70", "#2B344C", "Onboarding choice background fallback."],
  ["Onboarding Choice Border", "onboarding.choice.border", "#586489", "#50576B", "Onboarding choice border fallback."],
  ["Onboarding OTP Box Background", "onboarding.otp.box.background", "#3E4A70", "#2B344C", "OTP box background fallback."],
  ["Onboarding OTP Box Border", "onboarding.otp.box.border", "#586489", "#50576B", "OTP box border fallback."],
  ["Onboarding Progress Active", "onboarding.progress.active", "#00AEEF", "#00AEEF", "Active onboarding progress step."],
  ["Onboarding Progress Inactive", "onboarding.progress.inactive", "#D0D5DD", "#667085", "Inactive onboarding progress step."],
  ["Onboarding Header Icon", "onboarding.header.icon", "#FFFFFF", "#FFFFFF", "Onboarding header icon."],
  ["Soon Card Background", "soon.card.background", "#FFFFFF1F", "#FFFFFF1F", "Coming Soon glass card background."],
  ["Soon Card Border", "soon.card.border", "#FFFFFF3D", "#FFFFFF3D", "Coming Soon card border."],
  ["Soon Card Shadow", "soon.card.shadow", "#00000033", "#00000066", "Coming Soon card shadow."],
  ["Soon Image Placeholder", "soon.image.placeholder", "#00000033", "#00000052", "Coming Soon image placeholder overlay."],
  ["Soon Badge Start", "soon.badge.background.start", "#6750A4", "#D0BCFF", "Coming Soon badge gradient start."],
  ["Soon Badge End", "soon.badge.background.end", "#040F21", "#040F21", "Coming Soon badge gradient end."],
  ["Soon Badge Text", "soon.badge.text", "#FFFFFF", "#FFFFFF", "Coming Soon badge foreground."],
  ["Soon Vote Default", "soon.vote.icon.default", "#FFFFFF", "#FFFFFF", "Default vote icon."],
  ["Soon Vote Selected", "soon.vote.icon.selected", "#00AEEF", "#58AAF0", "Selected vote icon."],
  ["Soon Vote Disabled", "soon.vote.icon.disabled", "#FFFFFF61", "#FFFFFF61", "Disabled vote icon."],
  ["Subscription Background Top", "subscription.background.top", "#24325F", "#111827", "Subscription background gradient top."],
  ["Subscription Background Middle", "subscription.background.middle", "#324582", "#1F2A44", "Subscription background gradient middle."],
  ["Subscription Background Bottom", "subscription.background.bottom", "#17234F", "#080D1F", "Subscription background gradient bottom."],
  ["Subscription Status Bar", "subscription.status-bar.background", "#24325F", "#111827", "Subscription status bar background."],
  ["Subscription Nav Bar", "subscription.nav-bar.background", "#17234F", "#080D1F", "Subscription navigation bar background."],
  ["Subscription Card Background", "subscription.card.background", "#FFFFFF1F", "#FFFFFF1F", "Subscription glass card background."],
  ["Subscription Card Border", "subscription.card.border", "#FFFFFF3D", "#FFFFFF3D", "Subscription card border."],
  ["Subscription Card Shadow", "subscription.card.shadow", "#00000033", "#00000066", "Subscription card shadow."],
  ["Subscription CTA Background", "subscription.cta.background", "#6750A4", "#D0BCFF", "Subscription primary CTA background."],
  ["Subscription CTA Border", "subscription.cta.border", "#FFFFFF3D", "#FFFFFF3D", "Subscription CTA border."],
  ["Subscription Control Background", "subscription.control.background", "#FFFFFF1F", "#FFFFFF1F", "Subscription control background."],
  ["Subscription Control Border", "subscription.control.border", "#FFFFFF3D", "#FFFFFF3D", "Subscription control border."],
  ["Subscription Control Shadow", "subscription.control.shadow", "#00000033", "#00000066", "Subscription control shadow."],
  ["Subscription Panel Background", "subscription.panel.background", "#FFFFFF1F", "#FFFFFF1F", "Subscription panel background."],
  ["Subscription Panel Border", "subscription.panel.border", "#FFFFFF3D", "#FFFFFF3D", "Subscription panel border."],
  ["Subscription Plan Selected Border", "subscription.plan.selected-border", "#00AEEF", "#58AAF0", "Selected plan border."],
  ["Subscription Plan Unselected Border", "subscription.plan.unselected-border", "#FFFFFF3D", "#FFFFFF3D", "Unselected plan border."],
  ["Subscription Radio Fill", "subscription.plan.radio.selected-fill", "#00AEEF", "#58AAF0", "Selected plan radio fill."],
  ["Subscription Radio Check", "subscription.plan.radio.check", "#FFFFFF", "#111827", "Selected plan radio check."],
  ["Subscription Radio Border", "subscription.plan.radio.unselected-border", "#FFFFFF99", "#FFFFFF99", "Unselected plan radio border."],
  ["Episodes Card Background", "episodes.card.background", "#FFFFFF1F", "#FFFFFF1F", "Episodes glass card background."],
  ["Episodes Card Border", "episodes.card.border", "#FFFFFF3D", "#FFFFFF3D", "Episodes card border."],
  ["Episodes Hero Border", "episodes.hero.border", "#FFFFFF3D", "#FFFFFF3D", "Episodes hero border."],
  ["Episodes Hero Overlay", "episodes.hero.overlay", "#00000066", "#00000080", "Episodes hero image overlay."],
  ["Episodes Progress Track", "episodes.progress.track", "#FFFFFF3D", "#FFFFFF3D", "Episode progress track."],
  ["Episodes Tile Background", "episodes.tile.background", "#FFFFFF1F", "#FFFFFF1F", "Episode tile background."],
  ["Episodes Tile Border", "episodes.tile.border", "#FFFFFF3D", "#FFFFFF3D", "Episode tile border."],
  ["Episode Completed Background", "episodes.action.completed.background", "#00AEEF", "#58AAF0", "Completed episode action background."],
  ["Episode Completed Icon", "episodes.action.completed.icon", "#FFFFFF", "#FFFFFF", "Completed episode action icon."],
  ["Episode Continuing Background", "episodes.action.continuing.background", "#00AEEF", "#58AAF0", "Continuing episode action background."],
  ["Episode Continuing Icon", "episodes.action.continuing.icon", "#FFFFFF", "#FFFFFF", "Continuing episode action icon."],
  ["Episode Left Border", "episodes.action.left.border", "#FFFFFF99", "#FFFFFF99", "Unplayed episode action border."],
  ["Episode Left Icon", "episodes.action.left.icon", "#FFFFFF", "#FFFFFF", "Unplayed episode action icon."],
  ["Player Overlay Button Background", "player.overlay.button.background", "#FFFFFF1F", "#FFFFFF1F", "Player overlay button background."],
  ["Player Overlay Button Border", "player.overlay.button.border", "#FFFFFF3D", "#FFFFFF3D", "Player overlay button border."],
  ["Player Overlay Icon", "player.overlay.icon", "#FFFFFF", "#FFFFFF", "Player overlay icon."],
  ["Player Timeline Track", "player.timeline.track", "#FFFFFF3D", "#FFFFFF3D", "Player timeline track."],
  ["Player Timeline Fill", "player.timeline.fill", "#FFFFFF", "#FFFFFF", "Player timeline progress fill."],
  ["Player Timeline Label", "player.timeline.label", "#FFFFFFB3", "#FFFFFFB3", "Player timeline label."],
  ["Player Image Border", "player.image.border", "#FFFFFF3D", "#FFFFFF3D", "Player artwork border."],
  ["Story Feed Background", "story-feed.background", "#EAF5FF", "#141218", "Story feed background."],
  ["Story Feed Header Background", "story-feed.header.background", "#FFFFFF", "#1D1B20", "Story feed header background."],
  ["Story Feed Text Primary", "story-feed.text.primary", "#1C1B1F", "#E6E0E9", "Story feed primary text."],
  ["Story Feed Text Secondary", "story-feed.text.secondary", "#49454F", "#CAC4D0", "Story feed secondary text."],
  ["Story Feed Icon Primary", "story-feed.icon.primary", "#24325F", "#D0BCFF", "Story feed primary icon."],
  ["Story Page Surface", "story-page.surface", "#FFFFFF", "#1D1B20", "Story reading page surface."],
  ["Story Page Text", "story-page.text", "#1C1B1F", "#E6E0E9", "Story reading page text."],
  ["Player Sheet Background", "player.sheet.background", "#FFFFFF", "#1D1B20", "Player sheet background."],
  ["Player Sheet Text Primary", "player.sheet.text.primary", "#1C1B1F", "#E6E0E9", "Player sheet primary text."],
  ["Player Sheet Text Secondary", "player.sheet.text.secondary", "#49454F", "#CAC4D0", "Player sheet secondary text."],
  ["Player Sheet Control Primary", "player.sheet.control.primary", "#24325F", "#D0BCFF", "Player sheet primary control."],
  ["Player Sheet Control Disabled", "player.sheet.control.disabled", "#1C1B1F61", "#E6E0E961", "Player sheet disabled control."],
  ["Home Search Background", "home.search.background", "#FFFFFF1F", "#FFFFFF1F", "Home search glass background."],
  ["Home Search Border", "home.search.border", "#FFFFFF3D", "#FFFFFF3D", "Home search border."],
  ["Home Action Background", "home.action.background", "#FFFFFF1F", "#FFFFFF1F", "Home action button background."],
  ["Home Action Border", "home.action.border", "#FFFFFF3D", "#FFFFFF3D", "Home action button border."],
  ["Home Nav Background", "home.nav.background", "#FFFFFF1F", "#FFFFFF1F", "Home navigation background."],
  ["Home Nav Border", "home.nav.border", "#FFFFFF3D", "#FFFFFF3D", "Home navigation border."],
  ["Home Nav Active Background", "home.nav.active.background", "#FFFFFF26", "#FFFFFF26", "Active Home navigation item background."],
  ["Home Nav Active Border", "home.nav.active.border", "#FFFFFF52", "#FFFFFF52", "Active Home navigation item border."],
  ["Home Card Background", "home.card.background", "#FFFFFF1F", "#FFFFFF1F", "Home story card background."],
  ["Home Card Border", "home.card.border", "#FFFFFF3D", "#FFFFFF3D", "Home story card border."],
  ["Home Card Shadow", "home.card.shadow", "#00000033", "#00000066", "Home story card shadow."],
  ["Home Hero Overlay Start", "home.hero.overlay.start", "#0000000D", "#0000001A", "Home hero overlay start."],
  ["Home Hero Overlay Middle", "home.hero.overlay.middle", "#00000052", "#00000066", "Home hero overlay middle."],
  ["Home Hero Overlay End", "home.hero.overlay.end", "#000000CC", "#000000E6", "Home hero overlay end."],
  ["Home Hero Border", "home.hero.border", "#FFFFFF3D", "#FFFFFF3D", "Home hero border."],
  ["Home Hero Shadow", "home.hero.shadow", "#00000033", "#00000066", "Home hero shadow."],
  ["Story Card Image Placeholder", "home.story-card.image.placeholder", "#FFFFFF1A", "#FFFFFF1A", "Story card image placeholder."],
  ["Story Card Favorite Background", "home.story-card.favorite.background", "#00000052", "#00000066", "Story card favorite button background."],
  ["Story Card Favorite Border", "home.story-card.favorite.border", "#FFFFFF3D", "#FFFFFF3D", "Story card favorite button border."],
  ["Story Card Badge Background", "home.story-card.badge.background", "#00000066", "#00000080", "Story card badge background."],
  ["Story Card Badge Border", "home.story-card.badge.border", "#FFFFFF3D", "#FFFFFF3D", "Story card badge border."],
  ["Home Nav Icon Default", "home.nav.icon.default", "#FFFFFFB3", "#FFFFFFB3", "Default navigation icon."],
  ["Home Nav Icon Selected", "home.nav.icon.selected", "#FFFFFF", "#FFFFFF", "Selected navigation icon."],
  ["Home Nav Label Default", "home.nav.label.default", "#FFFFFFB3", "#FFFFFFB3", "Default navigation label."],
  ["Home Nav Label Selected", "home.nav.label.selected", "#FFFFFF", "#FFFFFF", "Selected navigation label."],
  ["Library Text Primary", "library.text.primary", "#1C1B1F", "#E6E0E9", "Library primary text."],
  ["Library Text Secondary", "library.text.secondary", "#49454F", "#CAC4D0", "Library secondary text."],
  ["Library Header Background", "library.header.background", "#FFFFFF", "#1D1B20", "Library header background."],
  ["Library Tab Active Background", "library.tab.active.background", "#EADDFF", "#4F378B", "Active Library tab background."],
  ["Library Tab Active Text", "library.tab.active.text", "#21005D", "#EADDFF", "Active Library tab text."],
  ["Library Tab Inactive Text", "library.tab.inactive.text", "#49454F", "#CAC4D0", "Inactive Library tab text."],
  ["Favorites Card Background", "favorites.card.background", "#FFFFFF1F", "#FFFFFF1F", "Favorites glass card background."],
  ["Favorites Card Border", "favorites.card.border", "#FFFFFF3D", "#FFFFFF3D", "Favorites card border."],
  ["Favorites Card Shadow", "favorites.card.shadow", "#00000033", "#00000066", "Favorites card shadow."],
  ["Favorites Icon Button Background", "favorites.icon-button.background", "#FFFFFF1F", "#FFFFFF1F", "Favorites icon button background."],
  ["Favorites Icon Button Foreground", "favorites.icon-button.foreground", "#FFFFFF", "#FFFFFF", "Favorites icon button foreground."],
  ["Favorites Empty CTA Background", "favorites.empty.cta.background", "#6750A4", "#D0BCFF", "Favorites empty CTA background."],
  ["Favorites Empty CTA Border", "favorites.empty.cta.border", "#FFFFFF3D", "#FFFFFF3D", "Favorites empty CTA border."],
];

type SemanticTypographySeed = readonly [name: string, key: string, size: string, lineHeight: string, letterSpacing: string, weight: string];

const semanticTypographySeeds: readonly SemanticTypographySeed[] = [
  ["Profile Header Title", "profile.header.title", "20", "1.2", "0", "600"],
  ["Profile Section Label", "profile.section.label", "12", "1.33", "0.5", "700"],
  ["Profile Row Title", "profile.row.title", "14", "1.43", "0", "600"],
  ["Profile Row Subtitle", "profile.row.subtitle", "10", "1.4", "0", "400"],
  ["Onboarding Header Title", "onboarding.header.title", "28", "1.21", "0", "700"],
  ["Onboarding Header Subtitle", "onboarding.header.subtitle", "14", "1.43", "0", "400"],
  ["Onboarding Form Label", "onboarding.form.label", "14", "1.43", "0", "600"],
  ["Onboarding Form Input", "onboarding.form.input", "16", "1.5", "0", "400"],
  ["Onboarding Choice Label", "onboarding.choice.label", "14", "1.43", "0", "600"],
  ["Onboarding CTA Label", "onboarding.cta.label", "16", "1.5", "0", "600"],
  ["Onboarding OTP Title", "onboarding.otp.title", "24", "1.33", "0", "700"],
  ["Onboarding OTP Caption", "onboarding.otp.caption", "14", "1.43", "0", "400"],
  ["Soon Header Title", "soon.header.title", "20", "1.2", "0", "600"],
  ["Soon Empty Title", "soon.empty.title", "20", "1.3", "0", "600"],
  ["Soon Empty Subtitle", "soon.empty.subtitle", "14", "1.43", "0", "400"],
  ["Soon Card Title", "soon.card.title", "16", "1.5", "0", "600"],
  ["Soon Badge Label", "soon.badge.label", "12", "1.33", "0", "600"],
  ["Subscription Header Title", "subscription.header.title", "20", "1.2", "0", "600"],
  ["Subscription Hero Title", "subscription.hero.title", "32", "1.25", "0", "700"],
  ["Subscription Hero Subtitle", "subscription.hero.subtitle", "16", "1.5", "0", "400"],
  ["Subscription Badge Label", "subscription.badge.label", "12", "1.33", "0", "700"],
  ["Subscription Benefits Heading", "subscription.benefits.heading", "18", "1.33", "0", "600"],
  ["Subscription Benefits Label", "subscription.benefits.label", "14", "1.43", "0", "500"],
  ["Subscription Plan Label", "subscription.plan.label", "16", "1.5", "0", "600"],
  ["Subscription Plan Price", "subscription.plan.price", "24", "1.33", "0", "700"],
  ["Subscription CTA Label", "subscription.cta.label", "16", "1.5", "0", "600"],
  ["Subscription Verification Title", "subscription.verification.title", "24", "1.33", "0", "700"],
  ["Subscription Verification Subtitle", "subscription.verification.subtitle", "14", "1.43", "0", "400"],
  ["Subscription Verification Digit", "subscription.verification.digit", "24", "1.33", "0", "600"],
  ["Episodes Header Title", "episodes.header.title", "20", "1.2", "0", "600"],
  ["Episodes Section Label", "episodes.section.label", "14", "1.43", "0", "600"],
  ["Episodes Hero Title", "episodes.hero.title", "24", "1.33", "0", "700"],
  ["Episodes Hero Meta", "episodes.hero.meta", "14", "1.43", "0", "400"],
  ["Episodes Tile Title", "episodes.tile.title", "16", "1.5", "0", "600"],
  ["Episodes Tile Meta", "episodes.tile.meta", "12", "1.33", "0", "400"],
  ["Player Timeline Label", "player.timeline.label", "12", "1.33", "0", "500"],
  ["Home Greeting Label", "home.greeting.label", "14", "1.43", "0", "400"],
  ["Home Greeting Name", "home.greeting.name", "20", "1.2", "0", "700"],
  ["Home Search Input", "home.search.input", "16", "1.5", "0", "400"],
  ["Home Section Title", "home.section.title", "20", "1.2", "0", "600"],
  ["Home Hero Eyebrow", "home.hero.eyebrow", "12", "1.33", "0.5", "600"],
  ["Home Hero Title", "home.hero.title", "28", "1.21", "0", "700"],
  ["Home Story Card Title", "home.story-card.title", "16", "1.5", "0", "600"],
  ["Home Story Card Meta", "home.story-card.meta", "12", "1.33", "0", "400"],
  ["Home Nav Label", "home.nav.label", "11", "1.45", "0", "500"],
  ["Favorites Header Title", "favorites.header.title", "20", "1.2", "0", "600"],
  ["Favorites Section Title", "favorites.section.title", "18", "1.33", "0", "600"],
  ["Favorites Section Action", "favorites.section.action", "14", "1.43", "0", "600"],
  ["Favorites Card Title", "favorites.card.title", "16", "1.5", "0", "600"],
  ["Favorites Empty Title", "favorites.empty.title", "20", "1.3", "0", "600"],
  ["Favorites Empty Subtitle", "favorites.empty.subtitle", "14", "1.43", "0", "400"],
  ["Favorites Empty CTA Label", "favorites.empty.cta.label", "16", "1.5", "0", "600"],
];

function defaultColorForTheme(theme: ThemeKey) {
  return theme === "dark" ? boopiDarkColorSeeds[0][2] : boopiColorSeeds[0][2];
}

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

function databaseColorValue(value: string) {
  // The mobile/API color contract is #RRGGBB. Alpha remains a component-level
  // concern until the design_tokens schema gains an explicit opacity field.
  return /^#[0-9a-f]{8}$/i.test(value) ? value.slice(0, 7) : value;
}

const defaultDesignTokens: DesignTokenPayload[] = [
  ...boopiColorSeeds.map(([, key, value, description], index) => ({
    token_key: key,
    token_value: value,
    token_type: "color",
    group_name: "boopi",
    theme: "light",
    description,
    sort_order: index,
    is_active: true,
  })),
  ...boopiDarkColorSeeds.map(([, key, value, description], index) => ({
    token_key: key,
    token_value: value,
    token_type: "color",
    group_name: "boopi",
    theme: "dark",
    description,
    sort_order: index,
    is_active: true,
  })),
  ...semanticColorSeeds.flatMap(([, key, light, dark, description], index) =>
    ([
      { token_key: key, token_value: databaseColorValue(light), token_type: "color", group_name: key.split(".")[0], theme: "light", description, sort_order: 100 + index, is_active: true },
      { token_key: key, token_value: databaseColorValue(dark), token_type: "color", group_name: key.split(".")[0], theme: "dark", description, sort_order: 100 + index, is_active: true },
    ] satisfies DesignTokenPayload[]),
  ),
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
    theme: "global",
    description: `${name} type token for Boopi app screens.`,
    sort_order: index,
    is_active: true,
  })),
  ...semanticTypographySeeds.map(([name, key, size, lineHeight, letterSpacing, weight], index) => ({
    token_key: key,
    token_value: JSON.stringify({ sample: name, size, lineHeight, letterSpacing, weight }),
    token_type: "typography",
    group_name: key.split(".")[0],
    theme: "global",
    description: `${name} type token for Boopi app screens.`,
    sort_order: 100 + index,
    is_active: true,
  })),
  ...presetSeeds.map(([, key, groupName, value, description], index) => ({
    token_key: key,
    token_value: JSON.stringify(value),
    token_type: "preset",
    group_name: groupName,
    theme: "global",
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

function presetDefaultsForCategory(category: string) {
  const defaults = { ...defaultPresetValue };

  switch (category) {
    case "Text":
      return { ...defaults, background: "#FFFFFF", foreground: "#1D1B2A", radius: "0", padding: "0", fillMode: "none", trackMode: "solid" };
    case "Image":
      return { ...defaults, background: "#E8DEF8", foreground: "#6750A4", radius: "12", padding: "0", trackMode: "solid" };
    case "Video":
      return { ...defaults, background: "#1D1B2A", foreground: "#FFFFFF", radius: "14", padding: "0", trackMode: "solid" };
    case "Carousel":
      return { ...defaults, background: "#EADDFF", foreground: "#21005D", radius: "12", padding: "8", trackMode: "solid" };
    case "Stories":
      return { ...defaults, background: "#24325F", foreground: "#FFFFFF", radius: "16", padding: "12", trackMode: "solid" };
    case "Progress":
    case "Progress Bar":
      return { ...defaults, foreground: "#4945FF", track: "#E0E0E0", radius: "4", padding: "0", fillMode: "solid", trackMode: "solid" };
    case "Divider":
      return { ...defaults, background: "#FFFFFF", foreground: "#79747E", radius: "0", padding: "0", fillMode: "none", trackMode: "solid" };
    case "Dialog":
      return { ...defaults, background: "#FFFFFF", foreground: "#1D1B2A", radius: "20", padding: "20", trackMode: "solid" };
    case "Tooltip":
      return { ...defaults, background: "#1D1B2A", foreground: "#FFFFFF", radius: "8", padding: "10", trackMode: "solid" };
    case "Button":
      return { ...defaults, background: "#4945FF", foreground: "#FFFFFF", radius: "12", padding: "14", trackMode: "solid" };
    default:
      return defaults;
  }
}

function presetNameFromKey(tokenKey: string) {
  return tokenName(tokenKey.replace(/^preset\.[^.]+\./, ""));
}

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("colors");
  const [activeTheme, setActiveTheme] = useState<ThemeKey>("light");
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
    const savedByKey = new Map(colorTokens.map((token) => [`${token.theme || "light"}:${token.token_key}`, token]));
    const seeds = activeTheme === "dark" ? boopiDarkColorSeeds : boopiColorSeeds;
    const seedKeys = new Set<string>(seeds.map(([, key]) => key));
    const seededCards = seeds.map(([name, key, value, description], index) => {
      const saved = savedByKey.get(`${activeTheme}:${key}`);
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

    const customCards = colorTokens
      .filter((token) => (token.theme || "light") === activeTheme && !seedKeys.has(token.token_key))
      .map((token) => ({
        id: token.id,
        name: tokenName(token.token_key),
        token_key: token.token_key,
        token_value: token.token_value,
        description: token.description,
        sort_order: token.sort_order ?? seededCards.length,
        is_active: token.is_active,
        savedToken: token,
      }));

    return [...seededCards, ...customCards];
  }, [activeTheme, colorTokens]);

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
  const renderPresetPreview = (category: string | null, value: ReturnType<typeof parsePresetValue>, compact = false) => {
    const fillBackground =
      value.fillMode === "none"
        ? "transparent"
        : value.fillMode === "gradient"
          ? `linear-gradient(135deg, ${value.background}, ${value.foreground})`
          : value.background;
    const secondaryColor = value.trackMode === "none" ? "transparent" : value.foreground;
    const contentBackground =
      value.trackMode === "gradient"
        ? `linear-gradient(135deg, ${value.foreground}, ${value.background})`
        : undefined;
    const textContentStyle =
      value.trackMode === "gradient"
        ? {
            background: contentBackground,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }
        : { color: secondaryColor };
    const trackBackground =
      value.trackMode === "none"
        ? "transparent"
        : value.trackMode === "gradient"
          ? `linear-gradient(135deg, ${value.track}, ${value.foreground})`
          : value.track;
    const progressFillBackground =
      value.fillMode === "none"
        ? "transparent"
        : value.fillMode === "gradient"
          ? `linear-gradient(90deg, ${value.foreground}, ${value.background})`
          : value.foreground;
    const baseStyle = {
      background: fillBackground,
      color: secondaryColor,
      borderRadius: `${value.radius}px`,
      padding: `${value.padding}px`,
    };

    switch (category) {
      case "Text":
        return (
          <div
            className="inline-block"
            style={{
              background: fillBackground,
              borderRadius: `${value.radius}px`,
              padding: `${value.padding}px`,
            }}
          >
            <span className={compact ? "text-xl font-semibold" : "text-3xl font-semibold"} style={textContentStyle}>
              Sample text
            </span>
          </div>
        );
      case "Image":
        return (
          <div className={`${compact ? "h-20 w-32" : "h-24 w-40"} flex items-center justify-center border border-[#ded9cf]`} style={baseStyle}>
            <ImageIcon className="h-7 w-7" />
          </div>
        );
      case "Video":
        return (
          <div className={`${compact ? "h-20 w-36" : "h-28 w-44"} flex items-center justify-center border border-[#ded9cf]`} style={baseStyle}>
            <span className="rounded-full bg-white/20 px-3 py-2 text-sm font-semibold">Play</span>
          </div>
        );
      case "Carousel":
        return (
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className={`${compact ? "h-16 w-12" : "h-24 w-16"} border border-[#ded9cf]`}
                style={{ ...baseStyle, opacity: item === 1 ? 1 : 0.55 }}
              />
            ))}
          </div>
        );
      case "Stories":
        return (
          <div className={`${compact ? "h-24 w-20" : "h-32 w-24"} flex items-end border border-[#ded9cf] text-xs font-semibold`} style={baseStyle}>
            Story
          </div>
        );
      case "Divider":
        return <div className="h-px w-40" style={{ background: value.trackMode === "gradient" ? contentBackground : secondaryColor }} />;
      case "Progress":
      case "Progress Bar":
        return (
          <div className={`${compact ? "h-4 w-40" : "h-5 w-44"} overflow-hidden`} style={{ background: trackBackground, borderRadius: `${value.radius}px` }}>
            <div className="h-full w-2/3" style={{ background: progressFillBackground, borderRadius: `${value.radius}px` }} />
          </div>
        );
      case "Lottie":
        return (
          <div className={`${compact ? "h-20 w-20" : "h-24 w-24"} flex items-center justify-center border border-[#ded9cf]`} style={baseStyle}>
            <Sparkles className="h-8 w-8" />
          </div>
        );
      case "Close":
        return (
          <div className="flex h-12 w-12 items-center justify-center border border-[#ded9cf]" style={baseStyle}>
            <X className="h-5 w-5" />
          </div>
        );
      case "Mute":
        return (
          <div className="border border-[#ded9cf] text-sm font-semibold" style={baseStyle}>
            Mute
          </div>
        );
      case "Bottom sheet":
        return (
          <div className={`${compact ? "h-24 w-32" : "h-32 w-44"} flex items-end rounded-lg border border-[#ded9cf] bg-white`}>
            <div className="h-2/3 w-full rounded-t-2xl border-t border-[#ded9cf]" style={baseStyle} />
          </div>
        );
      case "Dialog":
        return (
          <div className={`${compact ? "h-20 w-32" : "h-28 w-44"} border border-[#ded9cf] shadow-sm`} style={baseStyle}>
            Dialog
          </div>
        );
      case "Tooltip":
        return (
          <div className="max-w-40 border border-[#ded9cf] text-xs font-medium" style={baseStyle}>
            Tooltip text
          </div>
        );
      case "Container":
        return (
          <div className={`${compact ? "h-20 w-32" : "h-28 w-44"} border border-[#ded9cf]`} style={baseStyle}>
            Container
          </div>
        );
      case "Button":
      default:
        return (
          <div className="inline-flex min-h-12 min-w-32 items-center justify-center border border-[#ded9cf] text-sm font-semibold" style={baseStyle}>
            Button
          </div>
        );
    }
  };

  const fetchTokens = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("design_tokens")
      .select("id, token_key, token_value, token_type, group_name, theme, description, sort_order, is_active")
      .order("group_name", { ascending: true })
      .order("theme", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("token_key", { ascending: true });

    if (error) {
      console.error("Error fetching design tokens:", error);
      alert("Could not load design tokens. Please run the design system SQL first.");
    } else {
      const existingTokens = data || [];
      const existingKeys = new Set(existingTokens.map((token) => `${token.token_key}:${token.theme || "light"}`));
      const missingDefaults = defaultDesignTokens.filter((token) => !existingKeys.has(`${token.token_key}:${token.theme}`));

      if (missingDefaults.length > 0) {
        let seedError: { message: string; details?: string; hint?: string; code?: string } | null = null;

        // Keep each PostgREST request small enough for hosted deployments and
        // make a single failed batch diagnosable without losing earlier work.
        for (let offset = 0; offset < missingDefaults.length; offset += 40) {
          const batch = missingDefaults.slice(offset, offset + 40);
          const { error: batchError } = await supabase
            .from("design_tokens")
            .upsert(batch, { onConflict: "token_key,theme", ignoreDuplicates: true });

          if (batchError) {
            seedError = batchError;
            break;
          }
        }

        if (seedError) {
          console.error("Error seeding default design tokens:", seedError);
          alert(`Could not seed all design tokens: ${seedError.message}`);
          setTokens(existingTokens);
        } else {
          const { data: seededData, error: refetchError } = await supabase
            .from("design_tokens")
            .select("id, token_key, token_value, token_type, group_name, theme, description, sort_order, is_active")
            .order("group_name", { ascending: true })
            .order("theme", { ascending: true })
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
        theme: "global",
        description: "",
        token_value: JSON.stringify(presetDefaultsForCategory(category)),
      });
      return;
    }

    setFormData({
      ...defaultForm,
      token_type: tab === "typography" ? "typography" : "color",
      group_name: tab === "colors" ? "boopi" : tab,
      theme: tab === "colors" ? activeTheme : "global",
      token_value: tab === "colors" ? defaultColorForTheme(activeTheme) : "",
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
      theme: token.theme || "light",
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
    if (token.token_type === "color" && (token.theme === "light" || token.theme === "dark")) {
      setActiveTheme(token.theme);
    }
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
      theme: activeTab === "colors" ? activeTheme : "global",
      description: formData.description.trim() || null,
      sort_order: Number(formData.sort_order || 0),
      is_active: formData.is_active,
    };

    const { error } = editingId
      ? await supabase.from("design_tokens").update(payload).eq("id", editingId)
      : await supabase
          .from("design_tokens")
          .upsert([payload], { onConflict: "token_key,theme" });

    setSaving(false);
    if (error) {
      console.error("Error saving design token:", error);
      alert(`Could not save design token: ${error.message}`);
      return;
    }

    resetForm();
    fetchTokens();
  };

  const saveSeedToken = async (seed: (typeof boopiColorSeeds)[number] | (typeof boopiDarkColorSeeds)[number], index: number) => {
    setSaving(true);
    const [, key, value, description] = seed;
    const { error } = await supabase.from("design_tokens").insert([
      {
        token_key: key,
        token_value: value,
        token_type: "color",
        group_name: "boopi",
        theme: activeTheme,
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
      theme: token.savedToken?.theme || activeTheme,
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
      theme: "global",
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
        theme: "global",
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
      theme: "global",
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
      theme: "global",
      description: "",
      token_value: JSON.stringify(presetDefaultsForCategory(nextCategory)),
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
                <div className="flex rounded-full border border-[#e4dfd5] bg-white p-1">
                  {(["light", "dark"] as const).map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => {
                        setActiveTheme(theme);
                        setEditingId(null);
                        setFormData({
                          ...defaultForm,
                          token_type: "color",
                          group_name: "boopi",
                          theme,
                          token_value: defaultColorForTheme(theme),
                        });
                      }}
                      className={`rounded-full px-4 py-1.5 font-medium capitalize ${
                        activeTheme === theme ? "bg-[#1d1b2a] text-white" : "text-[#77758a] hover:text-[#1d1b2a]"
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
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
                          onClick={() => saveSeedToken(activeTheme === "dark" ? boopiDarkColorSeeds[index] : boopiColorSeeds[index], index)}
                          className="rounded-md p-1 text-[#5146ff] hover:bg-[#efedff]"
                          aria-label={`Create ${token.token_key}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="mt-5 text-sm text-[#77758a]">{activeTheme === "dark" ? "Dark" : "Light"}</p>
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
                            theme: activeTheme,
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
                        <div className="mt-5 flex min-h-28 items-center justify-center rounded-lg border border-[#ded9cf] bg-[#fffdfa] p-5">
                          {renderPresetPreview(preset.group_name, value, true)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {presetModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
                <form onSubmit={handlePresetSubmit} className="flex h-[min(860px,calc(100vh-40px))] w-full max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-2xl border border-[#ebe7df] bg-white shadow-2xl">
                  <div className="flex shrink-0 items-start justify-between border-b border-[#ebe7df] px-8 py-4">
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

                  <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(420px,1fr)_390px] overflow-hidden">
                    <div className="min-h-0 overflow-y-auto border-r border-[#ebe7df] p-4">
                      <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.12em] text-[#aaa6b6]">Element type</p>
                      {presetCategories.slice(1).map(([label, Icon]) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              group_name: label,
                              token_value: editingId ? formData.token_value : JSON.stringify(presetDefaultsForCategory(label)),
                            })
                          }
                          className={`mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium ${
                            formData.group_name === label ? "bg-[#5146ff] text-white ring-2 ring-[#7b72ff]" : "text-[#77758a] hover:bg-[#faf8f3]"
                          }`}
                        >
                          <Icon className="h-5 w-5" /> {label}
                        </button>
                      ))}
                    </div>

                    <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
                      <div className="grid items-start gap-5 border-b border-[#ebe7df] px-6 py-5 md:grid-cols-[minmax(0,1fr)_220px]">
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

                      <div className="flex min-h-0 overflow-auto bg-[#f7f6f2] p-8">
                        <div className="mx-auto flex min-h-[400px] w-[260px] shrink-0 items-center justify-center self-center rounded-lg border border-[#ebe7df] bg-white shadow-sm">
                          {renderPresetPreview(formData.group_name, currentPresetValue)}
                        </div>
                      </div>
                    </div>

                    <div key={`${editingId || "new"}-${formData.group_name}`} className="min-h-0 overflow-y-auto border-l border-[#ebe7df] bg-white">
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

                  <div className="flex shrink-0 justify-end gap-3 border-t border-[#ebe7df] bg-white px-8 py-4">
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
