interface RenderCardParams {
  name: string;
  title?: string;
  company?: string;
  location?: string;
  email?: string;
  theme: "light" | "dark";
  qrBase64: string; // The base64 data URI of the styled QR code
}

interface RenderSimpleParams {
  artworkBase64: string; // The base64 data URI of the pure AI art
  qrBase64: string; // The base64 data URI of the composite QR code
  theme: "light" | "dark";
}

// Escapes special characters for XML/SVG parsing safely
const escapeXml = (unsafe: string) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
};

/**
 * Renders a high-fidelity vertical 9:16 Digital ID Card (540x960).
 */
export async function renderCardImage(
  params: RenderCardParams,
): Promise<Buffer> {
  const {
    name,
    title = "",
    company = "",
    location = "",
    email = "",
    theme,
    qrBase64,
  } = params;
  const width = 540;
  const height = 960;

  const cleanName = escapeXml(name);
  const cleanTitle = escapeXml(title);
  const cleanCompany = escapeXml(company);
  const cleanLocation = escapeXml(location);
  const cleanEmail = escapeXml(email);

  const svg =
    theme === "dark"
      ? `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="darkBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#090d16" />
            <stop offset="100%" stop-color="#020408" />
          </linearGradient>
          <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#020617" />
          </linearGradient>
          <linearGradient id="glowGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#7c3aed" stop-opacity="0" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#000000" flood-opacity="0.3" />
          </filter>
        </defs>

        <rect width="${width}" height="${height}" fill="url(#darkBg)" rx="30" ry="30" />
        <rect x="25" y="25" width="490" height="910" fill="url(#cardGrad)" rx="24" ry="24" filter="url(#shadow)" stroke="#1e293b" stroke-width="1" />
        <path d="M 25 500 Q 150 400 300 600 T 515 550 L 515 935 L 25 935 Z" fill="url(#glowGrad1)" opacity="0.6" />

        <rect x="120" y="75" width="300" height="300" rx="16" ry="16" fill="#1e293b" stroke="#334155" stroke-width="1.5" opacity="0.6" />
        <text x="270" y="415" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="bold" fill="#fbbf24" letter-spacing="3" text-anchor="middle">AUTHENTIC DIGITAL ID</text>
        <line x1="25" y1="445" x2="515" y2="445" stroke="#1e293b" stroke-width="1" />

        ${cleanCompany ? `<text x="50" y="490" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#fbbf24" letter-spacing="1.5">${cleanCompany.toUpperCase()}</text>` : ""}
        <text x="50" y="535" font-family="Georgia, serif" font-size="32" font-weight="bold" fill="#f8fafc">${cleanName}</text>
        ${cleanTitle ? `<text x="50" y="575" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-style="italic" fill="#94a3b8">${cleanTitle}</text>` : ""}
        
        <line x1="50" y1="605" x2="110" y2="605" stroke="#334155" stroke-width="2" />

        ${
          cleanLocation
            ? `
        <g transform="translate(50, 632) scale(0.95)" opacity="0.9">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#fbbf24" />
        </g>
        <text x="82" y="650" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" fill="#cbd5e1" font-weight="500">${cleanLocation}</text>
        `
            : ""
        }

        ${
          cleanEmail
            ? `
        <g transform="translate(50, 680) scale(0.95)" opacity="0.9">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#fbbf24" />
        </g>
        <text x="82" y="698" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" fill="#cbd5e1" font-weight="500">${cleanEmail}</text>
        `
            : ""
        }

        <rect x="50" y="760" width="440" height="70" rx="35" ry="35" fill="#042f2e" stroke="#115e59" stroke-width="1.5" />
        <g transform="translate(160, 783) scale(1.05)">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm6 12H6v-1.5c0-1.99 4-3 6-3s6 1.01 6 3V18z" fill="#fbbf24" />
        </g>
        <text x="280" y="802" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="bold" fill="#fbbf24" letter-spacing="1.5" text-anchor="middle">SAVE CONTACT</text>

        <text x="270" y="885" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11.5" fill="#475569" text-anchor="middle">Scan to securely import credentials into your primary wallet.</text>

        <image href="${qrBase64}" x="135" y="90" width="270" height="270" rx="10" ry="10" />
      </svg>
    `
      : `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lightBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#f8fafc" />
            <stop offset="100%" stop-color="#e2e8f0" />
          </linearGradient>
          <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="100%" stop-color="#f8fafc" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#0f172a" flood-opacity="0.06" />
          </filter>
        </defs>

        <rect width="${width}" height="${height}" fill="url(#lightBg)" rx="30" ry="30" />
        <rect x="25" y="25" width="490" height="910" fill="url(#cardGrad)" rx="24" ry="24" filter="url(#shadow)" stroke="#f1f5f9" stroke-width="1" />

        <rect x="120" y="75" width="300" height="300" rx="16" ry="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
        <text x="270" y="415" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="bold" fill="#854d0e" letter-spacing="3" text-anchor="middle">AUTHENTIC DIGITAL ID</text>
        <line x1="25" y1="445" x2="515" y2="445" stroke="#f1f5f9" stroke-width="1" />

        ${cleanCompany ? `<text x="50" y="490" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#b45309" letter-spacing="1.5">${cleanCompany.toUpperCase()}</text>` : ""}
        <text x="50" y="535" font-family="Georgia, serif" font-size="32" font-weight="bold" fill="#0f172a">${cleanName}</text>
        ${cleanTitle ? `<text x="50" y="575" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-style="italic" fill="#475569">${cleanTitle}</text>` : ""}
        
        <line x1="50" y1="605" x2="110" y2="605" stroke="#cbd5e1" stroke-width="2" />

        ${
          cleanLocation
            ? `
        <g transform="translate(50, 632) scale(0.95)" opacity="0.9">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#9a3412" />
        </g>
        <text x="82" y="650" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" fill="#334155" font-weight="500">${cleanLocation}</text>
        `
            : ""
        }

        ${
          cleanEmail
            ? `
        <g transform="translate(50, 680) scale(0.95)" opacity="0.9">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#9a3412" />
        </g>
        <text x="82" y="698" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" fill="#334155" font-weight="500">${cleanEmail}</text>
        `
            : ""
        }

        <rect x="50" y="760" width="440" height="70" rx="35" ry="35" fill="#082f27" />
        <g transform="translate(160, 783) scale(1.05)">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm6 12H6v-1.5c0-1.99 4-3 6-3s6 1.01 6 3V18z" fill="#fbbf24" />
        </g>
        <text x="280" y="802" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="bold" fill="#ffffff" letter-spacing="1.5" text-anchor="middle">SAVE CONTACT</text>

        <text x="270" y="885" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11.5" fill="#94a3b8" text-anchor="middle">Scan to securely import credentials into your primary wallet.</text>

        <image href="${qrBase64}" x="135" y="90" width="270" height="270" rx="10" ry="10" />
      </svg>
    `;

  return Buffer.from(svg.trim());
}

/**
 * Renders a beautiful simple landscape card (960x540).
 * Displays pure AI artwork cleanly on the left, and styled composite QR code on the right.
 */
export async function renderSimpleLandscapeCard(
  params: RenderSimpleParams,
): Promise<Buffer> {
  const { artworkBase64, qrBase64, theme } = params;
  const width = 960;
  const height = 540;

  const svg =
    theme === "dark"
      ? `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="darkBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#090d16" />
            <stop offset="100%" stop-color="#020408" />
          </linearGradient>
          <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#020617" />
          </linearGradient>
          <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.12" />
            <stop offset="100%" stop-color="#7c3aed" stop-opacity="0" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.4" />
          </filter>
        </defs>

        <!-- Background -->
        <rect width="${width}" height="${height}" fill="url(#darkBg)" rx="30" ry="30" />
        <rect x="25" y="25" width="910" height="490" fill="url(#cardGrad)" rx="24" ry="24" filter="url(#shadow)" stroke="#1e293b" stroke-width="1" />
        <path d="M 25 300 Q 250 200 480 350 T 935 320 L 935 515 L 25 515 Z" fill="url(#glowGrad)" opacity="0.6" />

        <!-- Left Column: Pure AI Artwork Frame -->
        <rect x="50" y="50" width="440" height="440" rx="18" ry="18" fill="#1e293b" stroke="#334155" stroke-width="1.5" opacity="0.4" />
        <image href="${artworkBase64}" x="50" y="50" width="440" height="440" rx="18" ry="18" preserveAspectRatio="xMidYMid slice" />

        <!-- Center Divider -->
        <line x1="510" y1="60" x2="510" y2="480" stroke="#1e293b" stroke-width="1" />

        <!-- Right Column: Styled Composite QR Code -->
        <rect x="560" y="70" width="350" height="350" rx="20" ry="20" fill="#0b0f19" stroke="#1e293b" stroke-width="1" />
        <image href="${qrBase64}" x="575" y="85" width="320" height="320" rx="12" ry="12" />

        <!-- Label / Subtext -->
        <text x="735" y="460" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="bold" fill="#fbbf24" letter-spacing="4" text-anchor="middle">SCAN STYLED AI QR</text>
      </svg>
    `
      : `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lightBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#f8fafc" />
            <stop offset="100%" stop-color="#e2e8f0" />
          </linearGradient>
          <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="100%" stop-color="#f8fafc" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0f172a" flood-opacity="0.05" />
          </filter>
        </defs>

        <!-- Background -->
        <rect width="${width}" height="${height}" fill="url(#lightBg)" rx="30" ry="30" />
        <rect x="25" y="25" width="910" height="490" fill="url(#cardGrad)" rx="24" ry="24" filter="url(#shadow)" stroke="#f1f5f9" stroke-width="1" />

        <!-- Left Column: Pure AI Artwork Frame -->
        <rect x="50" y="50" width="440" height="440" rx="18" ry="18" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
        <image href="${artworkBase64}" x="50" y="50" width="440" height="440" rx="18" ry="18" preserveAspectRatio="xMidYMid slice" />

        <!-- Center Divider -->
        <line x1="510" y1="60" x2="510" y2="480" stroke="#f1f5f9" stroke-width="1" />

        <!-- Right Column: Styled Composite QR Code -->
        <rect x="560" y="70" width="350" height="350" rx="20" ry="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
        <image href="${qrBase64}" x="575" y="85" width="320" height="320" rx="12" ry="12" />

        <!-- Label / Subtext -->
        <text x="735" y="460" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="bold" fill="#854d0e" letter-spacing="4" text-anchor="middle">SCAN STYLED AI QR</text>
      </svg>
    `;

  return Buffer.from(svg.trim());
}
