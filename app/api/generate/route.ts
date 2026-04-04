import { NextRequest } from "next/server";
import { z } from "zod";
import { enhancePrompt } from "@/lib/langchain";
import { generateQRBuffer } from "@/lib/qrcode";
import { renderCardImage, renderSimpleLandscapeCard } from "@/lib/card";
import { generateBackground } from "@/lib/hf";

export const maxDuration = 60;

const RequestSchema = z.object({
  url: z.string().optional().or(z.literal("")),
  theme: z.string().min(3, "Theme must be at least 3 characters").max(200),
  mode: z.enum(["simple", "card"]).default("simple"),
  cardTheme: z.enum(["light", "dark"]).default("light"),
  qrType: z.enum(["url", "vcard"]).default("url"),
  name: z.string().max(100).optional(),
  title: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  location: z.string().max(150).optional(),
  email: z.string().max(150).optional(),
}).refine(
  (data) => {
    if (data.mode === "simple" && !data.url) return false;
    if (data.mode === "card" && data.qrType === "url" && !data.url) return false;
    if (data.mode === "card" && !data.name) return false;
    return true;
  },
  {
    message: "Name is required for Card mode, and URL is required for Link QR codes",
    path: ["url"]
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      url,
      theme,
      mode,
      cardTheme,
      qrType,
      name,
      title,
      company,
      location,
      email
    } = parsed.data;

    // 1. Enhance the prompt with AI
    const enhancedPrompt = await enhancePrompt(theme);

    // 2. Determine the payload to encode in the QR code
    let qrPayload = url || "";
    if (mode === "card" && qrType === "vcard" && name) {
      qrPayload = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${name}`,
        company ? `ORG:${company}` : "",
        title ? `TITLE:${title}` : "",
        email ? `EMAIL:${email}` : "",
        location ? `ADR:;;${location};;;;` : "",
        url ? `URL:${url}` : "",
        "END:VCARD"
      ].filter(Boolean).join("\n");
    }

    // 3. Generate the pure AI artwork first (single generation)
    const artworkBuffer = await generateBackground(enhancedPrompt);
    const artworkBase64 = `data:image/png;base64,${artworkBuffer.toString("base64")}`;

    // 4. Generate the clean QR code (without background image)
    const qrBuffer = await generateQRBuffer(qrPayload, 512);
    const qrBase64 = `data:image/png;base64,${qrBuffer.toString("base64")}`;

    if (mode === "card" && name) {
      // 5. Card mode: Render the vertical SVG card containing only the QR at the top
      const cardBuffer = await renderCardImage({
        name,
        title,
        company,
        location,
        email,
        theme: cardTheme,
        qrBase64
      });
      const imageData = `data:image/png;base64,${cardBuffer.toString("base64")}`;
      
      return Response.json({
        imageData,
        qrCodeData: qrBase64,
        artworkData: artworkBase64,
        prompt: enhancedPrompt,
        cardDetails: { name, title, company, location, email, theme: cardTheme }
      });
    }

    // 6. Simple Mode: Render landscape simple layout combining pure art and QR
    const landscapeBuffer = await renderSimpleLandscapeCard({
      artworkBase64,
      qrBase64,
      theme: cardTheme
    });
    const imageData = `data:image/png;base64,${landscapeBuffer.toString("base64")}`;

    return Response.json({
      imageData,
      qrCodeData: qrBase64,
      artworkData: artworkBase64,
      prompt: enhancedPrompt
    });
  } catch (error) {
    console.error("[/api/generate]", error);
    return Response.json(
      { error: "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}
