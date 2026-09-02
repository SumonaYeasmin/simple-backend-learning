import 'dotenv/config';
import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    console.log('Connecting to Neon PostgreSQL...');
    await client.connect();

    console.log('Adding password and role columns to User table...');
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT NOT NULL DEFAULT '';
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "Role" NOT NULL DEFAULT 'USER';
    `);

    console.log('✅ Successfully updated User table with password and role!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.end();
  }
}

main();
