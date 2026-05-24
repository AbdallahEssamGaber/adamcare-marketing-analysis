import { clearedSessionCookie } from "@/lib/auth";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("Set-Cookie", clearedSessionCookie());
  return res.status(200).json({ success: true });
}
