import { createFileRoute } from "@tanstack/react-router";
import { generateText, Output } from "ai";
import { z } from "zod";

const SYSTEM = `You are a senior editorial designer. Arrange raw newsletter content into a structured JSON layout.

STRICT CONTENT FIDELITY RULES:
- Every visible word in title, subtitle, issue, section title, kicker, body, item labels/values/details, stats, and footer MUST be copied verbatim from the user's raw content.
- Do not invent, summarize, rewrite, correct, expand, or add any content.
- Do not add dates, issue labels, taglines, calls to action, captions, statistics, highlights, or footer copy unless they appear in the raw content.
- You may only choose layout, grouping, icons, and visual hierarchy.
- Use an empty string for optional display fields when the raw content has no matching text.

Return ONLY valid JSON (no markdown fences) matching this TypeScript type:
{
  "title": string,              // copied exactly from raw content
  "subtitle": string,           // exact source text or empty
  "issue": string,              // exact source text or empty
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

Layout guidelines:
- Choose icons that semantically match each section.
- Use "stats" only when numeric data already exists in the source. Never invent numbers.
- Use "checklist" for safety/security tips.
- Use "hero" for the very first section only.
- Keep body text concise and punchy.
- 6-9 sections total.`;

const inputSchema = z.object({
  content: z.string().trim().min(1).max(30_000),
  theme: z.string().trim().min(1).max(80),
  design: z.enum(["Editorial", "Card Grid", "Briefing"]),
  iconStyle: z.enum(["Smart", "Badged", "Minimal"]),
});

const itemSchema = z.object({
  label: z.string(),
  value: z.string().optional(),
  detail: z.string().optional(),
});

const newsletterSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  issue: z.string(),
  accentHex: z.string(),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    kicker: z.string(),
    icon: z.enum(["sparkles", "shield", "trending", "users", "leaf", "award", "rocket", "phone", "bank", "chart", "lock", "heart"]),
    layout: z.enum(["hero", "feature", "stats", "checklist", "list", "quote", "contact"]),
    body: z.string(),
    items: z.array(itemSchema),
    stat: z.object({ number: z.string(), label: z.string() }).optional(),
  })).min(1).max(12),
  footer: z.string(),
});

function createLocalNewsletter(content: string) {
  const blocks = content.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  const title = blocks[0]?.split("\n")[0] || "";
  const sectionBlocks = blocks.length > 1 ? blocks.slice(1) : blocks;
  const sections = sectionBlocks.slice(0, 9).map((block, index) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const heading = lines[0] || `Update ${index + 1}`;
    const details = lines.slice(1);
    const isSecurity = /security|fraud|safe|password|otp/i.test(heading);
    const isContact = /contact/i.test(heading);
    return {
      id: `section-${index + 1}`,
      title: heading,
      kicker: heading,
      icon: (isSecurity ? "shield" : isContact ? "phone" : index === 0 ? "sparkles" : "trending") as "shield" | "phone" | "sparkles" | "trending",
      layout: (index === 0 ? "hero" : isSecurity ? "checklist" : isContact ? "contact" : "list") as "hero" | "checklist" | "contact" | "list",
      body: details.length === 1 ? details[0] : "",
      items: (details.length === 1 ? [] : details).map((line) => {
        const [label, ...value] = line.split(":");
        return { label, ...(value.length ? { value: value.join(":").trim() } : {}) };
      }),
    };
  });

  return {
    title,
    subtitle: "",
    issue: "",
    accentHex: "#2563eb",
    sections,
    footer: "",
  };
}

export const Route = createFileRoute("/api/generate-newsletter")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsedInput = inputSchema.safeParse(await request.json());
        if (!parsedInput.success) return new Response("Invalid newsletter content", { status: 400 });
        const { content, theme, design, iconStyle } = parsedInput.data;
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return Response.json(createLocalNewsletter(content), {
            headers: { "X-Newsletter-Mode": "local" },
          });
        }

        try {
          const { createLovableAiGatewayProvider, getLovableAiGatewayResponseHeaders, getLovableAiGatewayRunId } = await import("@/lib/ai-gateway.server");
          const gateway = createLovableAiGatewayProvider(key, getLovableAiGatewayRunId(request));
          const result = await generateText({
            model: gateway("google/gemini-3-flash-preview"),
            system: SYSTEM,
            prompt: `Theme preference: ${theme}\nDesign preference: ${design}\nIcon treatment: ${iconStyle}. Select each section icon to match its meaning.\n\nRaw newsletter content:\n${content}`,
            output: Output.object({ schema: newsletterSchema }),
          });
          return Response.json(result.output, {
            headers: getLovableAiGatewayResponseHeaders(result.response.headers),
          });
        } catch (error) {
          const status = typeof error === "object" && error !== null && "statusCode" in error
            ? Number(error.statusCode)
            : 500;
          if (status === 429) return new Response("Rate limit reached. Please retry shortly.", { status });
          if (status === 402) return new Response("AI credits exhausted. Add credits in your workspace.", { status });
          console.error("Newsletter generation failed", error);
          return new Response("AI generation failed. Please try again.", { status: 500 });
        }
      },
    },
  },
});
