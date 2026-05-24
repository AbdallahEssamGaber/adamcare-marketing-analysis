import { requireSession } from "@/lib/auth";

export default function handler(req, res) {
  return res.status(200).json({ authenticated: requireSession(req) });
}
