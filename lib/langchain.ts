import { ChatMistralAI } from "@langchain/mistralai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const PROMPT_TEMPLATE = `You are an expert Stable Diffusion prompt engineer specializing in QR code art.
Given a user's visual theme, produce a single optimized Stable Diffusion prompt (max 75 tokens)
that will be used to style a QR code via ControlNet.
The prompt must preserve QR code scannability — avoid heavy foreground clutter or text overlays.
Output ONLY the prompt text. No explanations, no prefixes, no quotes.

User theme: {theme}

Stable Diffusion prompt:`;

// Lazy chain — built on first call so the API key is read at runtime, not build time
let chain: ReturnType<typeof buildChain> | null = null;

function buildChain() {
  const model = new ChatMistralAI({
    apiKey: process.env.MISTRAL_API_KEY,
    model: "mistral-small-latest",
    temperature: 0.7,
    maxTokens: 150,
  });

  return PromptTemplate.fromTemplate(PROMPT_TEMPLATE)
    .pipe(model)
    .pipe(new StringOutputParser());
}

export async function enhancePrompt(theme: string): Promise<string> {
  if (!chain) chain = buildChain();
  const result = await chain.invoke({ theme });
  return result.trim();
}
