import { createFileRoute } from "@tanstack/react-router";
import { generateText, Output } from "ai";
import { z } from "zod";

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

const inputSchema = z.object({
  content: z.string().trim().min(1).max(30_000),
  theme: z.string().trim().min(1).max(80),
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
  const title = blocks[0]?.split("\n")[0] || "Newsletter";
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
      kicker: index === 0 ? "FEATURED UPDATE" : isSecurity ? "SECURITY CORNER" : isContact ? "STAY CONNECTED" : "LATEST NEWS",
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
    subtitle: "Designed locally from your content",
    issue: new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date()),
    accentHex: "#2563eb",
    sections,
    footer: "Thank you for reading.",
  };
}

export const Route = createFileRoute("/api/generate-newsletter")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsedInput = inputSchema.safeParse(await request.json());
        if (!parsedInput.success) return new Response("Invalid newsletter content", { status: 400 });
        const { content, theme } = parsedInput.data;
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
            prompt: `Theme preference: ${theme}\n\nRaw newsletter content:\n${content}`,
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
