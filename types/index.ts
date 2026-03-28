export interface GenerateRequest {
  url: string;
  theme: string;
}

export interface GenerateResponse {
  imageData: string; // base64 data URI of card (if card mode) or QR code
  prompt: string;
  qrCodeData?: string; // base64 data URI of standalone QR code (optional)
  artworkData?: string; // base64 data URI of pure AI artwork (optional)
  cardDetails?: {
    name: string;
    title?: string;
    company?: string;
    location?: string;
    email?: string;
    theme: "light" | "dark";
  };
}

export interface GalleryEntry {
  id: string;
  url: string;
  theme: string;
  imageData: string; // base64 data URI
  prompt: string;
  createdAt: string;
  qrCodeData?: string;
  artworkData?: string;
  cardDetails?: {
    name: string;
    title?: string;
    company?: string;
    location?: string;
    email?: string;
    theme: "light" | "dark";
  };
}
