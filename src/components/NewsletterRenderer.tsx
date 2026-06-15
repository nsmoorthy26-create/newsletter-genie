import { iconMap, themes, type DesignKey, type IconStyle, type Newsletter, type Section, type ThemeKey } from "@/lib/newsletter-types";

type SectionProps = {
  s: Section;
  theme: typeof themes[ThemeKey];
  design: DesignKey;
  iconStyle: IconStyle;
};

function Donut({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 120" className="size-32">
      <circle cx="60" cy="60" r="48" fill="none" stroke={color} strokeOpacity="0.15" strokeWidth="14" />
      <circle cx="60" cy="60" r="48" fill="none" stroke={color} strokeWidth="14"
        strokeDasharray={`${0.78 * 2 * Math.PI * 48} ${2 * Math.PI * 48}`}
        strokeLinecap="round" transform="rotate(-90 60 60)" />
    </svg>
  );
}

function Bars({ color }: { color: string }) {
  const vals = [40, 65, 50, 80, 55, 95];
  return (
    <svg viewBox="0 0 160 80" className="w-40 h-20">
      {vals.map((v, i) => (
        <rect key={i} x={i * 26 + 4} y={80 - v * 0.7} width="18" height={v * 0.7} rx="3" fill={color} opacity={0.4 + i * 0.1} />
      ))}
    </svg>
  );
}

function SectionBlock({ s, theme, design, iconStyle }: SectionProps) {
  const Icon = iconMap[s.icon] ?? iconMap.sparkles;
  const frame = design === "compact" ? "rounded-xl p-5" : design === "cards" ? "rounded-2xl p-7 shadow-lg" : "rounded-3xl p-8";

  if (s.layout === "hero") {
    return (
      <header className={`relative overflow-hidden ${design === "compact" ? "rounded-xl p-7" : "rounded-3xl p-10 md:p-14"} ${theme.card}`} style={{ backgroundImage: theme.pattern }}>
        <Kicker s={s} theme={theme} iconStyle={iconStyle} />
        <h2 className={`mt-4 text-4xl md:text-5xl font-bold leading-tight ${theme.text}`}>{s.title}</h2>
        {s.body && <p className={`mt-4 max-w-2xl text-base md:text-lg ${theme.muted}`}>{s.body}</p>}
        {s.items.length > 0 && (
          <ul className="mt-8 grid sm:grid-cols-2 gap-3">
            {s.items.map((it, i) => (
              <li key={i} className={`flex items-start gap-3 rounded-xl p-3 ${theme.text}`} style={{ background: theme.accentSoft }}>
                <span className="mt-1 size-2 rounded-full shrink-0" style={{ background: theme.accent }} />
                <span className="text-sm font-medium">{it.label}</span>
              </li>
            ))}
          </ul>
        )}
      </header>
    );
  }

  if (s.layout === "stats") {
    return (
      <section className={`${frame} ${theme.card} ${theme.text}`}>
        <Kicker s={s} theme={theme} iconStyle={iconStyle} />
        <div className="mt-6 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h3 className="text-2xl font-bold">{s.title}</h3>
            {s.body && <p className={`mt-2 ${theme.muted}`}>{s.body}</p>}
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {s.items.map((it, i) => (
                <div key={i} className="rounded-xl border p-3" style={{ borderColor: theme.accentSoft }}>
                  <div className="text-xs uppercase tracking-wider opacity-60">{it.label}</div>
                  {it.value && <div className="text-xl font-bold" style={{ color: theme.accent }}>{it.value}</div>}
                  {it.detail && <div className="text-sm mt-1">{it.detail}</div>}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center">
            {s.stat ? (
              <>
                <Donut color={theme.accent} />
                <div className="-mt-20 text-center pointer-events-none">
                  <div className="text-3xl font-bold" style={{ color: theme.accent }}>{s.stat.number}</div>
                </div>
                <div className={`mt-12 text-xs uppercase tracking-wider ${theme.muted}`}>{s.stat.label}</div>
              </>
            ) : (
              <Bars color={theme.accent} />
            )}
          </div>
        </div>
      </section>
    );
  }

  if (s.layout === "checklist") {
    return (
      <section className={`${frame} ${theme.card} ${theme.text}`}>
        <Kicker s={s} theme={theme} iconStyle={iconStyle} />
        <h3 className="mt-3 text-2xl font-bold">{s.title}</h3>
        {s.body && <p className={`mt-2 ${theme.muted}`}>{s.body}</p>}
        <ul className="mt-5 space-y-2">
          {s.items.map((it, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg p-3" style={{ background: theme.accentSoft }}>
              <span className="mt-0.5 grid place-items-center size-6 rounded-full text-white text-xs font-bold" style={{ background: theme.accent }}>✓</span>
              <div>
                <div className="font-medium">{it.label}</div>
                {it.detail && <div className={`text-sm ${theme.muted}`}>{it.detail}</div>}
              </div>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (s.layout === "contact") {
    return (
      <section className={`rounded-3xl p-8 ${theme.text}`} style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)` }}>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-white/80">
          <Icon className={iconStyle === "badged" ? "size-7 rounded-lg bg-white/20 p-1.5" : "size-4"} /> {s.kicker}
        </div>
        <h3 className="mt-3 text-2xl font-bold text-white">{s.title}</h3>
        {s.body && <p className="mt-2 text-white/90">{s.body}</p>}
        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          {s.items.map((it, i) => (
            <div key={i} className="rounded-xl bg-white/15 backdrop-blur p-3 text-white">
              <div className="text-xs uppercase tracking-wider opacity-80">{it.label}</div>
              {it.value && <div className="font-semibold">{it.value}</div>}
            </div>
          ))}
        </div>
      </section>
    );
  }

  // feature / list / quote default
  return (
    <section className={`${frame} ${theme.card} ${theme.text}`}>
      <Kicker s={s} theme={theme} iconStyle={iconStyle} />
      <h3 className="mt-3 text-2xl font-bold">{s.title}</h3>
      {s.body && <p className={`mt-2 ${theme.muted}`}>{s.body}</p>}
      {s.items.length > 0 && (
        <ul className={`mt-5 ${s.layout === "list" ? "grid sm:grid-cols-2 gap-3" : "space-y-2"}`}>
          {s.items.map((it, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg p-3" style={{ background: theme.accentSoft }}>
              <span className="mt-1 size-2 rounded-full shrink-0" style={{ background: theme.accent }} />
              <div>
                <div className="font-medium">{it.label}</div>
                {it.value && <div className="text-sm font-semibold" style={{ color: theme.accent }}>{it.value}</div>}
                {it.detail && <div className={`text-sm ${theme.muted}`}>{it.detail}</div>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Kicker({ s, theme, iconStyle }: { s: Section; theme: typeof themes[ThemeKey]; iconStyle: IconStyle }) {
  const Icon = iconMap[s.icon] ?? iconMap.sparkles;
  return (
    <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: theme.accent }}>
      <span className={iconStyle === "badged" ? "grid size-8 place-items-center rounded-lg" : "contents"} style={iconStyle === "badged" ? { background: theme.accentSoft } : undefined}>
        <Icon className={iconStyle === "minimal" ? "size-3.5 opacity-70" : "size-4"} />
      </span>
      {s.kicker}
    </div>
  );
}

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((character) => character + character).join("") : value;
  const number = Number.parseInt(normalized, 16);
  if (Number.isNaN(number)) return `rgba(37,99,235,${alpha})`;
  return `rgba(${number >> 16},${(number >> 8) & 255},${number & 255},${alpha})`;
}

export function NewsletterRenderer({ data, themeKey, design, iconStyle, customColor }: { data: Newsletter; themeKey: ThemeKey; design: DesignKey; iconStyle: IconStyle; customColor?: string }) {
  const baseTheme = themes[themeKey];
  const theme = themeKey === "custom" && customColor ? {
    ...baseTheme,
    accent: customColor,
    accentSoft: hexToRgba(customColor, 0.12),
    pattern: `radial-gradient(circle at 100% 0%, ${hexToRgba(customColor, 0.18)}, transparent 50%)`,
  } : baseTheme;
  return (
    <div className={`min-h-full rounded-3xl p-6 md:p-10 ${theme.bg}`}>
      <div className={`mx-auto max-w-4xl ${design === "compact" ? "space-y-3" : design === "cards" ? "grid gap-5 md:grid-cols-2" : "space-y-6"}`}>
        <div className={`flex items-center justify-between text-xs uppercase tracking-[0.25em] ${theme.muted}`}>
          <span>{data.issue}</span>
          <span>{data.subtitle}</span>
        </div>
        <h1 className={`text-3xl md:text-4xl font-black tracking-tight ${theme.text} ${design === "cards" ? "md:col-span-2" : ""}`}>{data.title}</h1>
        {data.sections.map((s, index) => <div key={s.id} className={design === "cards" && (index === 0 || s.layout === "contact") ? "md:col-span-2" : ""}><SectionBlock s={s} theme={theme} design={design} iconStyle={iconStyle} /></div>)}
        <footer className={`text-center text-xs ${theme.muted} pt-4 ${design === "cards" ? "md:col-span-2" : ""}`}>{data.footer}</footer>
      </div>
    </div>
  );
}
