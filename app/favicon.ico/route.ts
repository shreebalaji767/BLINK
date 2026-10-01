import { NextResponse } from "next/server";

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="BLSSNVJ21 BLINK"><rect width="64" height="64" rx="16" fill="#050507"/><rect x="7" y="7" width="50" height="50" rx="13" fill="#fff"/><path d="M18 18h8l6 10 6-10h8L36 34v12h-8V34z" fill="#050507"/></svg>`;

export function GET() {
  return new NextResponse(icon, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
