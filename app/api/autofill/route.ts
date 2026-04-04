import { NextRequest } from "next/server";
import { ChatMistralAI } from "@langchain/mistralai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

const RequestSchema = z.object({
  text: z.string().min(5, "Bio text must be at least 5 characters"),
});

const PROMPT_TEMPLATE = `You are a helpful assistant. Your task is to analyze introduction text, biography, or an email signature, and extract details to construct a professional digital business card.

Extract:
- name: Full name of the person
- title: Job title or role
- company: Company name, organization, or department
- location: City, region, or country
- email: Email address
- url: Website URL or social profile URL (if present)
- theme: Generate a matching visual theme prompt (e.g. "neon cyberpunk city at night", "minimalist watercolor pastel shapes", "retro synthwave sunset", "clean elegant abstract workspace", "golden luxury aesthetic") based on their profession or style.

Return ONLY a valid JSON object. No explanations, no prefixes, no Markdown wrapper codeblocks, no formatting text.

User bio text:
"{text}"

JSON Output:`;

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

    const { text } = parsed.data;

    // Use Mistral to extract fields
    const model = new ChatMistralAI({
      apiKey: process.env.MISTRAL_API_KEY,
      model: "mistral-small-latest",
      temperature: 0.2, // low temperature for precise extraction
      maxTokens: 300,
    });

    const chain = PromptTemplate.fromTemplate(PROMPT_TEMPLATE)
      .pipe(model)
      .pipe(new StringOutputParser());

    const responseText = await chain.invoke({ text });
    
    // Clean potential markdown tags if the model added them anyway
    const cleanJson = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const data = JSON.parse(cleanJson);

    return Response.json(data);
  } catch (error) {
    console.error("[/api/autofill]", error);
    return Response.json(
      { error: "AI parsing failed. Please fill the fields manually." },
      { status: 500 }
    );
  }
}
