import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "Contact";
    const title = searchParams.get("title") || "";
    const company = searchParams.get("company") || "";
    const email = searchParams.get("email") || "";
    const location = searchParams.get("location") || "";
    const url = searchParams.get("url") || "";

    const vCardLines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${name}`,
      company ? `ORG:${company}` : "",
      title ? `TITLE:${title}` : "",
      email ? `EMAIL:${email}` : "",
      location ? `ADR:;;${location};;;;` : "",
      url ? `URL:${url}` : "",
      "END:VCARD"
    ].filter(Boolean);

    const vCardString = vCardLines.join("\r\n");

    const safeFileName = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    return new Response(vCardString, {
      status: 200,
      headers: {
        "Content-Type": "text/vcard; charset=utf-8",
        "Content-Disposition": `attachment; filename="contact-${safeFileName}.vcf"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[/api/vcard]", error);
    return new Response("Failed to generate vCard file.", { status: 500 });
  }
}
