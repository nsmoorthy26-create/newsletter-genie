import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

export function createLovableAiGatewayProvider(apiKey: string, initialRunId?: string) {
  let runId = initialRunId?.trim() || undefined;

  const provider = createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set(RUN_ID_HEADER, runId);
      const response = await fetch(input, { ...init, headers });
      runId = response.headers.get(RUN_ID_HEADER)?.trim() || runId;
      return response;
    },
  });

  return Object.assign(provider, { getRunId: () => runId });
}

export function getLovableAiGatewayRunId(request: Request) {
  return request.headers.get(RUN_ID_HEADER)?.trim() || undefined;
}

export function getLovableAiGatewayResponseHeaders(providerHeaders?: HeadersInit) {
  const headers = new Headers();
  new Headers(providerHeaders).forEach((value, name) => {
    if (name.toLowerCase().startsWith("x-lovable-aig-")) headers.set(name, value);
  });
  if ([...headers.keys()].length) {
    headers.set("Access-Control-Expose-Headers", [...headers.keys()].join(", "));
  }
  return headers;
}