import 'dotenv/config';
import { Pool } from 'pg';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });

async function main() {
  console.log('Applying migrations manually via pg pool...');

  // 1. Add STAFF to Role enum if not exists
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'Role' AND e.enumlabel = 'STAFF'
      ) THEN
        ALTER TYPE "Role" ADD VALUE 'STAFF';
      END IF;
    END
    $$;
  `);
  console.log('✅ Role enum updated with STAFF value');

  // 2. Add staffPermissions column to User table if not exists
  await pool.query(`
    ALTER TABLE "User" 
    ADD COLUMN IF NOT EXISTS "staffPermissions" TEXT;
  `);
  console.log('✅ User table updated with staffPermissions column');

  await pool.end();
  console.log('Migration complete!');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
