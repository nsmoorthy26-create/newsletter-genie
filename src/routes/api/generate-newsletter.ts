import { createFileRoute } from "@tanstack/react-router";

const SYSTEM = `You are a senior editorial designer. Convert raw newsletter content into a structured JSON layout suitable for rendering as a beautifully designed newsletter with infographics.

Return ONLY valid JSON (no markdown fences) matching this TypeScript type:
{
  "title": string,              // catchy newsletter title
  "subtitle": string,           // one-line tagline
  "issue": string,              // e.g. "Issue 01 · June 2026"
  "accentHex": string,          // primary accent hex color matching theme
  "sections": Array<{
    "id": string,
    "title": string,
    "kicker": string,           // short uppercase label like "PRODUCT SPOTLIGHT"
    "icon": "sparkles"|"shield"|"trending"|"users"|"leaf"|"award"|"rocket"|"phone"|"bank"|"chart"|"lock"|"heart",
    "layout": "hero"|"feature"|"stats"|"checklist"|"list"|"quote"|"contact",
    "body": string,             // short paragraph (can be empty)
    "items": Array<{ "label": string, "value"?: string, "detail"?: string }>, // bullets / stats / checklist
    "stat"?: { "number": string, "label": string } // optional highlight stat for infographic
  }>,
  "footer": string
}

Guidelines:
- Choose icons that semantically match each section.
- Use "stats" layout when numeric infographic helps; invent reasonable round numbers if helpful (label them as "highlight").
- Use "checklist" for safety/security tips.
- Use "hero" for the very first section only.
- Keep body text concise and punchy.
- 6-9 sections total.`;

export const Route = createFileRoute("/api/generate-newsletter")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { content, theme } = (await request.json()) as {
          content: string;
          theme: string;
        };
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        if (!content?.trim()) return new Response("Missing content", { status: 400 });

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: SYSTEM },
              {
                role: "user",
                content: `Theme preference: ${theme}\n\nRaw newsletter content:\n${content}`,
              },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          return new Response(text, { status: res.status });
        }
        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content ?? "{}";
        let parsed: unknown;
        try {
          parsed = JSON.parse(raw);
        } catch {
          const m = raw.match(/\{[\s\S]*\}/);
          parsed = m ? JSON.parse(m[0]) : {};
        }
        return Response.json(parsed);
      },
    },
  },
});
