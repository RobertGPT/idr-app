import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * API route for retrieving all badges.
 *
 * Responds to `GET` requests by returning an array of Badge objects
 * from the database.  Other HTTP methods will return a 405 status.
 */
export default async function handler(req: any, res: any): Promise<void> {
  if (req.method === 'GET') {
    const badges = await prisma.badge.findMany();
    res.status(200).json(badges);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
