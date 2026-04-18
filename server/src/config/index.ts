import { env, isProduction } from "./env";

export const config = {
  env,
  isProduction,
  server: {
    port: env.PORT,
    url: env.APP_URL,
    ip: env.SERVER_IP,
  },
  client: {
    url: env.CLIENT_URL,
  },
  db: {
    connectionString: env.DATABASE_URL,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
  },
  ws: {
    url: env.WS_URL,
    reconnectDelay: env.WS_RECONNECT_DELAY,
    maxReconnectAttempts: env.WS_MAX_RECONNECT_ATTEMPTS,
  },
  auth: {
    accessTokenSecret: env.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: env.REFRESH_TOKEN_SECRET,
    accessTokenTTL: env.ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenTTL: env.REFRESH_TOKEN_EXPIRES_IN,
  },
};
