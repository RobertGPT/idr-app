// pages/api/db-test.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type NowRow = { now: Date };

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const rows = await prisma.$queryRaw<NowRow[]>`SELECT NOW() as now`;
    res.status(200).json({ ok: true, time: rows[0]?.now ?? null });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: String(error) });
  }
}
