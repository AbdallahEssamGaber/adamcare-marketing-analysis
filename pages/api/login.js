import { createHmac, timingSafeEqual } from "crypto";
import { createSessionToken, sessionCookie } from "@/lib/auth";

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ah = createHmac("sha256", "compare").update(a).digest();
  const bh = createHmac("sha256", "compare").update(b).digest();
  return timingSafeEqual(ah, bh);
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const expected = process.env.SECRET_KEY;
  if (!expected) {
    return res.status(503).json({ error: "SECRET_KEY not configured" });
  }

  const { key } = req.body || {};
  if (!safeEqual(key, expected)) {
    return res.status(401).json({ error: "Invalid key" });
  }

  res.setHeader("Set-Cookie", sessionCookie(createSessionToken()));
  return res.status(200).json({ success: true });
}
