import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

// Ensure a single PrismaClient is reused across requests in development
const globalForPrisma = global as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["error", "warn"] });
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    /*
      Treat either:
      - POST requests (body contains data), or
      - GET requests that include a module_slug in the query
      as requests to insert a completion.
    */
    if (
      req.method === "POST" ||
      (req.method === "GET" && typeof req.query.module_slug === "string")
    ) {
      const {
        client_id,
        module_slug,
        rating,
        note,
      } = req.method === "POST" ? req.body : req.query;

      if (!client_id || !module_slug) {
        return res.status(400).json({
          ok: false,
          error: "client_id and module_slug are required",
        });
      }

      // If a user with this client_id exists, use it; otherwise create one.
      const user = await prisma.user.upsert({
        where: { client_id: client_id as string },
        update: {},
        create: { client_id: client_id as string },
        select: { id: true, client_id: true },
      });

      // Insert a new completion record
      await prisma.completion.create({
        data: {
          user_id: user.id,
          module_slug: module_slug as string,
          rating:
            typeof rating === "number"
              ? rating
              : rating
              ? Number(rating)
              : null,
          note: note ? String(note) : null,
        },
      });

      // Respond OK (no BigInt returned)
      return res.status(201).json({ ok: true });
    }

    // GET requests without module_slug will list completions for a given client_id
    if (req.method === "GET") {
      const client_id = String(req.query.client_id ?? "");
      const limit = Math.min(Number(req.query.limit ?? 10), 50);

      if (!client_id) {
        return res.status(400).json({
          ok: false,
          error: "client_id is required",
        });
      }

      const user = await prisma.user.findUnique({
        where: { client_id },
        select: { id: true },
      });
      if (!user) {
        return res.status(200).json({ ok: true, completions: [] });
      }

      const completions = await prisma.completion.findMany({
        where: { user_id: user.id },
        orderBy: { occurred_at: "desc" },
        take: limit,
      });

      // Convert BigInt IDs to numbers to avoid serialization errors
      const safeCompletions = completions.map((c) => ({
        ...c,
        id: Number(c.id),
      }));

      return res.status(200).json({
        ok: true,
        count: safeCompletions.length,
        completions: safeCompletions,
      });
    }

    // If method is neither POST nor GET, return 405
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({
      ok: false,
      error: `Method ${req.method} not allowed`,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: String(error),
    });
  }
}

