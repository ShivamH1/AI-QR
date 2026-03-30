import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// andreasjansson/qrcode-monster — takes qr_code_content (URL) directly, no pre-generated QR needed
const MODEL_VERSION =
  "andreasjansson/qrcode-monster:75d51a73fce3c00de31ed9ab4358c73e8fc0f627dc8ce975818e653317cb919b";

export interface ReplicateQRInput {
  prompt: string;
  qr_code_content: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  controlnet_conditioning_scale?: number;
  num_outputs?: number;
}

export async function generateStyledQR(input: ReplicateQRInput): Promise<string> {
  const output = (await replicate.run(MODEL_VERSION, {
    input: {
      prompt: input.prompt,
      qr_code_content: input.qr_code_content,
      negative_prompt:
        input.negative_prompt ??
        "ugly, blurry, low quality, text, watermark, deformed, artifacts, noise",
      width: input.width ?? 768,
      height: input.height ?? 768,
      num_outputs: 1,
      num_inference_steps: input.num_inference_steps ?? 40,
      guidance_scale: input.guidance_scale ?? 7.5,
      controlnet_conditioning_scale: input.controlnet_conditioning_scale ?? 1.5,
    },
  })) as string[];

  if (!output || output.length === 0) {
    throw new Error("Replicate returned no output");
  }

  return output[0];
}
