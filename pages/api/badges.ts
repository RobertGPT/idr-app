// pages/api/badges.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient in serverless environments
const globalForPrisma = global as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: { id: "asc" },
    });
    res.status(200).json({ ok: true, count: badges.length, badges });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: String(error) });
  }
}
