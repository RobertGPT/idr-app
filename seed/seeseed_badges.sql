-- SQL script for seeding badge data into the `badges` table.
--
-- This script mirrors the contents of badges.config.json.  It can be
-- executed manually against a PostgreSQL database when Prisma is not
-- available or when a direct SQL seed is preferable.

INSERT INTO badges (id, label, criteria) VALUES
  ('early_bird', 'Early Bird', 'Complete Morning Momentum 5 times'),
  ('resilient', 'Resilient', 'Bounce back after 3 setbacks');
