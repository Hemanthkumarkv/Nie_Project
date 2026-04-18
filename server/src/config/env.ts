import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  APP_URL: z.string().url().default("http://localhost:5000"),
  SERVER_IP: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().optional(),
  DB_USER: z.string().default("postgres"),
  DB_PASSWORD: z.string().default(""),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().default("Sensor_db"),
  WS_URL: z.string().url().default("ws://localhost:8081"),
  WS_RECONNECT_DELAY: z.coerce.number().default(5000),
  WS_MAX_RECONNECT_ATTEMPTS: z.coerce.number().default(10),
  ACCESS_TOKEN_SECRET: z
    .string()
    .min(10, "ACCESS_TOKEN_SECRET must be at least 10 characters")
    .default("dev-access-secret"),
  REFRESH_TOKEN_SECRET: z
    .string()
    .min(10, "REFRESH_TOKEN_SECRET must be at least 10 characters")
    .default("dev-refresh-secret"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  ADMIN_EMAIL: z.string().email().default("admin@example.com"),
  ADMIN_PASSWORD: z.string().min(6).default("admin123"),
  ADMIN_USERNAME: z.string().default("admin"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment configuration",
    parsedEnv.error.flatten(),
  );
  throw new Error(
    "Environment validation failed. Please check your .env file.",
  );
}

export const env = parsedEnv.data;
export const isProduction = env.NODE_ENV === "production";
