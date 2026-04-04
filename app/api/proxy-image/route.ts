import { NextRequest } from "next/server";
import { z } from "zod";

const QuerySchema = z.object({
  url: z.string().url(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = QuerySchema.safeParse({ url: searchParams.get("url") });

  if (!parsed.success) {
    return new Response("Invalid URL parameter", { status: 400 });
  }

  const { url } = parsed.data;

  // Only proxy Replicate CDN URLs
  const allowed = ["replicate.delivery", "pbxt.replicate.delivery"];
  const hostname = new URL(url).hostname;
  if (!allowed.some((h) => hostname.endsWith(h))) {
    return new Response("URL not allowed", { status: 403 });
  }

  const imageResponse = await fetch(url);
  if (!imageResponse.ok) {
    return new Response("Failed to fetch image", { status: 502 });
  }

  const contentType = imageResponse.headers.get("content-type") ?? "image/png";
  const buffer = await imageResponse.arrayBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": 'attachment; filename="ai-qr.png"',
      "Cache-Control": "public, max-age=86400",
    },
  });
}
