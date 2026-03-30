import QRCode from "qrcode";

/**
 * Generates a QR code PNG buffer with solid black modules on a solid white background.
 * Used as a mask for the artistic compositing pipeline — the composite.ts module
 * handles blending with AI art.
 * 
 * Uses H (highest) error correction to allow up to ~30% damage/artistic overlay
 * while remaining scannable.
 */
export async function generateQRBuffer(url: string, size: number = 512): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    errorCorrectionLevel: "H",
    width: size,
    margin: 3,
    color: {
      dark: "#000000ff",  // Solid black data modules
      light: "#ffffffff", // Solid white background
    },
  });
}
