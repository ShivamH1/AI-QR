import sharp from "sharp";
import { generateQRBuffer } from "./qrcode";

/**
 * Generates a beautiful composite QR code where the AI art is visible through
 * both dark and light QR modules. Instead of overlaying an opaque QR on art,
 * this creates a dual-tone artistic blend:
 *
 * - Dark/data modules → heavily darkened version of the AI art
 * - Light/empty modules → brightened version of the AI art
 *
 * The contrast between the two tones ensures scannability while keeping
 * the artwork visible throughout. Uses H-level error correction (~30% tolerance).
 */
export async function generateCompositeQR(
  url: string,
  artworkBuffer: Buffer,
): Promise<Buffer> {
  const SIZE = 512;

  const qrRawBuffer = await generateQRBuffer(url, SIZE);

  // 1. Resize & normalize the AI art to target size as PNG for pipeline compatibility
  const artBase = await sharp(artworkBuffer)
    .resize(SIZE, SIZE, { fit: "cover" })
    .removeAlpha()
    .png()
    .toBuffer();

  // 2. DARK version (for QR data modules) — heavily darkened, slightly desaturated
  const darkArt = await sharp(artBase)
    .modulate({ brightness: 0.3, saturation: 0.7 })
    .removeAlpha()
    .png()
    .toBuffer();

  // 3. LIGHT version (for QR background modules) — brightened, pushed towards white
  const lightArt = await sharp(artBase)
    .modulate({ brightness: 1.4, saturation: 0.85 })
    .linear(0.6, 100) // Shift towards white while retaining some art texture
    .removeAlpha()
    .png()
    .toBuffer();

  // 4. Create a clean binary mask from the QR code
  //    White (255) = light/empty modules, Black (0) = dark/data modules
  const qrMask = await sharp(qrRawBuffer)
    .resize(SIZE, SIZE, { kernel: "nearest" }) // Nearest-neighbor keeps sharp module edges
    .grayscale()
    .threshold(128) // Pure binary
    .raw()
    .toBuffer();

  // 5. Get raw RGB pixels of the light art
  const lightRaw = await sharp(lightArt)
    .resize(SIZE, SIZE)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 6. Build RGBA buffer: lightArt RGB + QR mask as alpha channel
  //    Where mask is white (light modules) → lightArt is fully opaque → shows through
  //    Where mask is black (dark modules) → lightArt is fully transparent → darkArt shows
  const rgbaBuffer = Buffer.alloc(SIZE * SIZE * 4);
  for (let i = 0; i < SIZE * SIZE; i++) {
    rgbaBuffer[i * 4 + 0] = lightRaw.data[i * 3 + 0]; // R
    rgbaBuffer[i * 4 + 1] = lightRaw.data[i * 3 + 1]; // G
    rgbaBuffer[i * 4 + 2] = lightRaw.data[i * 3 + 2]; // B
    rgbaBuffer[i * 4 + 3] = qrMask[i]; // A from QR mask
  }

  // 7. Final composite: darkArt base + masked lightArt on top
  return sharp(darkArt)
    .resize(SIZE, SIZE)
    .composite([
      {
        input: rgbaBuffer,
        raw: { width: SIZE, height: SIZE, channels: 4 },
        blend: "over",
      },
    ])
    .jpeg({ quality: 94 })
    .toBuffer();
}
