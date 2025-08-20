// pages/api/completions.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["error", "warn"] });
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

/**
 * POST: record a completion
 * body: { client_id: string, module_slug: string, rating?: number, note?: string }
 *
 * GET: list recent completions
 * query: ?client_id=abc&limit=10
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "POST" ||
  (req.method === "GET" && typeof req.query.module_slug === "string")
) {

      const {
  client_id,
  module_slug,
  rating,
  note,
} = req.method === "POST" ? req.body : req.query;

      if (!client_id || !module_slug) {
        return res.status(400).json({ ok: false, error: "client_id and module_slug are required" });
      }

      // create/find user by client_id
      const user = await prisma.user.upsert({
        where: { client_id },
        update: {},
        create: { client_id },
        select: { id: true, client_id: true },
      });

      const completion = await prisma.completion.create({
        data: {
          user_id: user.id,
          module_slug,
          rating: typeof rating === "number" ? rating : null,
          note: note ?? null,
        },
      });

      return res.status(201).json({ ok: true, completion, user });
    }

    if (req.method === "GET") {
      const client_id = String(req.query.client_id ?? "");
      const limit = Math.min(Number(req.query.limit ?? 10), 50);
      if (!client_id) {
        return res.status(400).json({ ok: false, error: "client_id is required" });
      }

      const user = await prisma.user.findUnique({
        where: { client_id },
        select: { id: true },
      });
      if (!user) return res.status(200).json({ ok: true, completions: [] });

      const completions = await prisma.completion.findMany({
        where: { user_id: user.id },
        orderBy: { occurred_at: "desc" },
        take: limit,
      });

      return res.status(200).json({ ok: true, count: completions.length, completions });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: String(error) });
  }
}
