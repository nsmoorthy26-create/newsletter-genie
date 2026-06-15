import {
  Sparkles, Shield, TrendingUp, Users, Leaf, Award, Rocket,
  Phone, Landmark, BarChart3, Lock, Heart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Section = {
  id: string;
  title: string;
  kicker: string;
  icon: keyof typeof iconMap;
  layout: "hero" | "feature" | "stats" | "checklist" | "list" | "quote" | "contact";
  body: string;
  items: { label: string; value?: string; detail?: string }[];
  stat?: { number: string; label: string };
};

export type Newsletter = {
  title: string;
  subtitle: string;
  issue: string;
  accentHex: string;
  sections: Section[];
  footer: string;
};

export const iconMap = {
  sparkles: Sparkles, shield: Shield, trending: TrendingUp, users: Users,
  leaf: Leaf, award: Award, rocket: Rocket, phone: Phone,
  bank: Landmark, chart: BarChart3, lock: Lock, heart: Heart,
} satisfies Record<string, LucideIcon>;

export type ThemeKey = "midnight" | "sunrise" | "forest" | "mono";
export type DesignKey = "editorial" | "cards" | "compact";
export type IconStyle = "suggested" | "badged" | "minimal";

export const designs: Record<DesignKey, { name: string; description: string }> = {
  editorial: { name: "Editorial", description: "Spacious magazine flow" },
  cards: { name: "Card Grid", description: "Dynamic two-column layout" },
  compact: { name: "Briefing", description: "Dense, scannable update" },
};

export const iconStyles: Record<IconStyle, { name: string; description: string }> = {
  suggested: { name: "Smart", description: "AI picks contextual icons" },
  badged: { name: "Badged", description: "Icons in accent badges" },
  minimal: { name: "Minimal", description: "Subtle line icons" },
};

export const themes: Record<ThemeKey, { name: string; bg: string; card: string; text: string; muted: string; accent: string; accentSoft: string; ring: string; pattern: string }> = {
  midnight: {
    name: "Midnight Ink",
    bg: "bg-[#0b1020]", card: "bg-[#121a33]", text: "text-slate-100", muted: "text-slate-400",
    accent: "#7c9cff", accentSoft: "rgba(124,156,255,0.15)", ring: "ring-[#7c9cff]/30",
    pattern: "radial-gradient(circle at 20% 0%, rgba(124,156,255,0.18), transparent 50%), radial-gradient(circle at 80% 100%, rgba(236,72,153,0.12), transparent 50%)",
  },
  sunrise: {
    name: "Sunrise Press",
    bg: "bg-[#fff7ed]", card: "bg-white", text: "text-stone-900", muted: "text-stone-500",
    accent: "#ea580c", accentSoft: "rgba(234,88,12,0.12)", ring: "ring-orange-300",
    pattern: "radial-gradient(circle at 0% 0%, rgba(234,88,12,0.15), transparent 45%), radial-gradient(circle at 100% 100%, rgba(217,119,6,0.12), transparent 45%)",
  },
  forest: {
    name: "Forest Editorial",
    bg: "bg-[#f1f6f1]", card: "bg-white", text: "text-emerald-950", muted: "text-emerald-700/70",
    accent: "#047857", accentSoft: "rgba(4,120,87,0.12)", ring: "ring-emerald-300",
    pattern: "radial-gradient(circle at 100% 0%, rgba(4,120,87,0.18), transparent 50%), radial-gradient(circle at 0% 100%, rgba(16,185,129,0.12), transparent 50%)",
  },
  mono: {
    name: "Mono Brutalist",
    bg: "bg-stone-100", card: "bg-white", text: "text-stone-900", muted: "text-stone-500",
    accent: "#111827", accentSoft: "rgba(17,24,39,0.08)", ring: "ring-stone-400",
    pattern: "repeating-linear-gradient(45deg, rgba(0,0,0,0.04) 0 2px, transparent 2px 12px)",
  },
};
