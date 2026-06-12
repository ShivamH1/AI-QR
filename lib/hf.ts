import { HfInference } from "@huggingface/inference";

let hf: HfInference | null = null;

function getClient(): HfInference {
  if (!hf) hf = new HfInference(process.env.HF_TOKEN);
  return hf;
}

export async function generateBackground(prompt: string): Promise<Buffer> {
  const blob = await getClient().textToImage(
    {
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: prompt,
      parameters: {
        width: 512,
        height: 512,
        num_inference_steps: 4,
      },
    },
    { outputType: "blob" },
  );

  return Buffer.from(await blob.arrayBuffer());
}
