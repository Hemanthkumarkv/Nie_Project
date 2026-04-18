import pkg from "pg";
import { config } from "../config";
import { hashPassword } from "../utils/crypto";
const { Pool } = pkg;

const connectionOptions = config.db.connectionString
  ? { connectionString: config.db.connectionString }
  : {
    user: config.db.user,
    host: config.db.host,
    database: config.db.database,
    password: config.db.password,
    port: config.db.port,
  };

export const pool = new Pool(connectionOptions);

// DB Table setup
export async function initDB() {
  // Ensure UUID generation is available (needed for Prisma User table)
  await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  // Ensure Prisma enums exist before creating the User table
  await pool.query(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
        CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LoginType') THEN
        CREATE TYPE "LoginType" AS ENUM ('EMAIL_PASSWORD', 'GOOGLE', 'GITHUB');
      END IF;
    END $$;
  `);

  // Create User table to match Prisma schema (used by auth controller)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "User" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role "UserRole" NOT NULL DEFAULT 'USER',
      "loginType" "LoginType" NOT NULL DEFAULT 'EMAIL_PASSWORD',
      "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
      "refreshToken" TEXT,
      "emailVerificationToken" TEXT,
      "emailVerificationExpiry" TIMESTAMPTZ,
      "forgotPasswordToken" TEXT,
      "forgotPasswordExpiry" TIMESTAMPTZ,
      "avatarUrl" TEXT,
      "avatarLocalPath" TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Keep updatedAt in sync for User rows
  await pool.query(`
    CREATE OR REPLACE FUNCTION update_user_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW."updatedAt" = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await pool.query(`
    DROP TRIGGER IF EXISTS update_user_updated_at ON "User";
    CREATE TRIGGER update_user_updated_at
      BEFORE UPDATE ON "User"
      FOR EACH ROW
      EXECUTE FUNCTION update_user_updated_at();
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sensor_device (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Add created_at column to existing tables if it doesn't exist
  await pool.query(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_device' AND column_name = 'created_at'
      ) THEN
        ALTER TABLE sensor_device ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        -- Update existing rows to have a created_at timestamp
        UPDATE sensor_device SET created_at = NOW() WHERE created_at IS NULL;
      END IF;
    END $$;
  `);

  // Add updated_at column to existing tables if it doesn't exist
  await pool.query(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_device' AND column_name = 'updated_at'
      ) THEN
        ALTER TABLE sensor_device ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        -- Update existing rows to have an updated_at timestamp
        UPDATE sensor_device SET updated_at = NOW() WHERE updated_at IS NULL;
      END IF;
    END $$;
  `);

  // Create trigger to automatically update updated_at on row update
  await pool.query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await pool.query(`
    DROP TRIGGER IF EXISTS update_sensor_device_updated_at ON sensor_device;
    CREATE TRIGGER update_sensor_device_updated_at
      BEFORE UPDATE ON sensor_device
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sensor_parameter (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      unit TEXT,
      value DOUBLE PRECISION,
      status TEXT,
      device_id INTEGER REFERENCES sensor_device(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await seedDefaultUser();

  console.log("✅ Tables ready");
}

async function seedDefaultUser() {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) FROM "User"');
    const userCount = parseInt(rows[0].count);

    if (userCount === 0) {
      console.log("🌱 No users found. Seeding default admin user...");

      const hashedPassword = await hashPassword(config.env.ADMIN_PASSWORD);

      await pool.query(
        `INSERT INTO "User" (email, username, password, role, "isEmailVerified", "loginType") 
         VALUES ($1, $2, $3, 'ADMIN', true, 'EMAIL_PASSWORD')`,
        [
          config.env.ADMIN_EMAIL,
          config.env.ADMIN_USERNAME,
          hashedPassword
        ]
      );

      console.log(`✅ Default admin user created: ${config.env.ADMIN_EMAIL}`);
    } else {
      console.log(`✅ Database already has ${userCount} users. Skipping seeding.`);
    }
  } catch (error) {
    console.error("❌ Error seeding default user:", error);
  }
}
