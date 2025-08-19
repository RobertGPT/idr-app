// pages/api/db-test.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await prisma.$queryRaw`SELECT NOW() as now`;
    res.status(200).json({ ok: true, time: result[0] });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: String(error) });
  } finally {
    // optional: Prisma will reuse connections in serverless; leaving this out is usually fine
    // await prisma.$disconnect();
  }
}
