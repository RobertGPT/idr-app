import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

/**
 * Seed the database with modules and badges defined in the seed folder.
 *
 * Modules are loaded from `seed/source_to_module_map.json` where each
 * key/value pair corresponds to a module title and slug.  Badges are
 * loaded from `seed/badges.config.json` as an array of objects.  If
 * modules or badges already exist, this script will attempt to insert
 * duplicates and may throw on conflicting IDs or unique constraints.
 */
async function main(): Promise<void> {
  // Resolve paths relative to the project root
  const moduleMapPath = path.join(__dirname, '..', 'seed', 'source_to_module_map.json');
  const badgesPath = path.join(__dirname, '..', 'seed', 'badges.config.json');

  // Read and parse module definitions
  const modules: Record<string, string> = JSON.parse(fs.readFileSync(moduleMapPath, 'utf8'));
  for (const [title, slug] of Object.entries(modules)) {
    await prisma.module.create({ data: { title, slug, content: '' } });
  }

  // Read and parse badges
  const badges: Array<{ id: string; label: string; criteria: string }> = JSON.parse(fs.readFileSync(badgesPath, 'utf8'));
  for (const badge of badges) {
    await prisma.badge.create({ data: badge });
  }
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
