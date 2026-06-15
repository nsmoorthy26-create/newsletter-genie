import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Badge,
  LayoutGrid,
  Loader2,
  Minus,
  Newspaper,
  Printer,
  Rows3,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { NewsletterRenderer } from "@/components/NewsletterRenderer";
import {
  designs,
  iconStyles,
  themes,
  type DesignKey,
  type IconStyle,
  type Newsletter,
  type ThemeKey,
} from "@/lib/newsletter-types";

const designIcons = { editorial: Newspaper, cards: LayoutGrid, compact: Rows3 };
const styleIcons = { suggested: WandSparkles, badged: Badge, minimal: Minus };

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Newsletter Builder" },
      {
        name: "description",
        content:
          "Paste your content. AI designs a beautiful newsletter with infographics and themes.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [content, setContent] = useState("");
  const [themeKey, setThemeKey] = useState<ThemeKey>("midnight");
  const [customColor, setCustomColor] = useState("#2563eb");
  const [design, setDesign] = useState<DesignKey>("editorial");
  const [iconStyle, setIconStyle] = useState<IconStyle>("suggested");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Newsletter | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          theme: themeKey === "custom" ? `Custom ${customColor}` : themes[themeKey].name,
          design: designs[design].name,
          iconStyle: iconStyles[iconStyle].name,
        }),
      });
      if (!res.ok) {
        if (res.status === 429) throw new Error("Rate limit reached. Please retry shortly.");
        if (res.status === 402)
          throw new Error("AI credits exhausted. Add credits in your workspace.");
        throw new Error(await res.text());
      }
      const json = (await res.json()) as Newsletter;
      if (!json.sections) throw new Error("Unexpected AI response.");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <header className="border-b bg-white/60 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid place-items-center size-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Smart Newsletter Builder</h1>
              <p className="text-xs text-muted-foreground">Paste content · AI designs the layout</p>
            </div>
          </div>
          {data && (
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="size-4" /> Print / PDF
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 grid lg:grid-cols-[420px_1fr] gap-6">
        <aside className="space-y-4 print:hidden">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <label className="text-sm font-semibold">Newsletter content</label>
            <p className="text-xs text-muted-foreground mb-2">
              Drop in raw text — headings, bullets, anything.
            </p>
            <Textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setData(null);
              }}
              rows={16}
              placeholder="Paste only the content you want included in the newsletter…"
              className="min-h-80 font-mono leading-relaxed"
            />
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <label className="text-sm font-semibold">Theme</label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(Object.keys(themes) as ThemeKey[]).map((k) => {
                const t = themes[k];
                const active = themeKey === k;
                return (
                  <Button
                    key={k}
                    type="button"
                    variant="ghost"
                    onClick={() => setThemeKey(k)}
                    className={`h-auto justify-start text-left rounded-xl border-2 p-3 transition ${active ? "border-primary ring-2 ring-ring" : "border-transparent hover:border-border"}`}
                  >
                    <div className="flex gap-1 mb-2">
                      {k === "custom" ? (
                        <input
                          type="color"
                          value={customColor}
                          aria-label="Choose custom newsletter color"
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => {
                            setCustomColor(event.target.value);
                            setThemeKey("custom");
                          }}
                          className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
                        />
                      ) : (
                        <span className="size-4 rounded" style={{ background: t.accent }} />
                      )}
                      <span className="size-4 rounded bg-white border" />
                      <span
                        className="size-4 rounded"
                        style={{
                          background: k === "custom" ? customColor : t.accent,
                          opacity: 0.4,
                        }}
                      />
                    </div>
                    <div className="text-xs font-semibold">{t.name}</div>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <label className="text-sm font-semibold">Design</label>
            <p className="mb-3 text-xs text-muted-foreground">
              Changes the newsletter composition.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(designs) as DesignKey[]).map((key) => {
                const Icon = designIcons[key];
                return (
                  <Button
                    key={key}
                    type="button"
                    variant={design === key ? "default" : "outline"}
                    onClick={() => setDesign(key)}
                    className="h-auto flex-col gap-1.5 px-2 py-3"
                  >
                    <Icon className="size-4" />
                    <span className="text-xs">{designs[key].name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <label className="text-sm font-semibold">Icon suggestion</label>
            <p className="mb-3 text-xs text-muted-foreground">
              Choose how contextual icons are presented.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(iconStyles) as IconStyle[]).map((key) => {
                const Icon = styleIcons[key];
                return (
                  <Button
                    key={key}
                    type="button"
                    variant={iconStyle === key ? "default" : "outline"}
                    onClick={() => setIconStyle(key)}
                    className="h-auto flex-col gap-1.5 px-2 py-3"
                  >
                    <Icon className="size-4" />
                    <span className="text-xs">{iconStyles[key].name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <Button
            onClick={generate}
            disabled={loading || !content.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Designing…
              </>
            ) : (
              <>
                <Sparkles className="size-4" /> Generate Newsletter
              </>
            )}
          </Button>
          {error && (
            <div className="text-sm text-red-600 rounded-lg bg-red-50 p-3 border border-red-200">
              {error}
            </div>
          )}
        </aside>

        <section className="min-h-[600px]">
          {data ? (
            <NewsletterRenderer
              data={data}
              themeKey={themeKey}
              design={design}
              iconStyle={iconStyle}
              customColor={customColor}
            />
          ) : (
            <div className="h-full grid place-items-center rounded-3xl border-2 border-dashed bg-white/40 p-16 text-center">
              <div>
                <div className="mx-auto grid place-items-center size-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
                  <Sparkles className="size-8" />
                </div>
                <h2 className="mt-4 text-xl font-bold">
                  Your designed newsletter will appear here
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  Paste your raw content on the left, choose a theme, and let AI design a polished
                  layout with infographics.
                </p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
