// import express from "express";
// import cors from "cors";
// import healthRouter from "./routes/health";
// import statusRouter from "./routes/status";
// import dataRouter from "./routes/data";
// import deviceRouter from "./routes/devices";
// import cookieParser from "cookie-parser";
// import authRoutes from "./routes/auth.routes";

// const app = express();
// // app.use(cors());
// app.use(
//   cors({
//     // origin: ["http://localhost:5173"],
//     origin: "*",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser()); // Add this for cookie support

// // Modular routes
// app.use("/health", healthRouter);
// app.use("/connection-status", statusRouter);
// // app.use("/data", dataRouter);
// app.use("/device", deviceRouter);
// app.use("/api/data", dataRouter);

// // // ----------------users-----------------

// // app.use("/api/v1/users", userRouter);
// app.use("/api/v1/users", authRoutes);
// app.get("/health", (_req, res) => res.status(200).send("ok"));

// app.use((err: any, _req: any, res: any, _next: any) => {
//   const status = err?.statusCode || 500;
//   res.status(status).json({
//     statusCode: status,
//     message: err?.message || "Internal Server Error",
//   });
// });

// export default app;

// // // http://localhost:3000/device  -Get devices
// // // http://localhost:3000/device/1 - Get By Id

// // // http://localhost:3000/api/v1/users/register
// // // http://localhost:3000/api/v1/users/login
// // //
// // ===================================
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import healthRouter from "./routes/health";
import statusRouter from "./routes/status";
import dataRouter from "./routes/data";
import deviceRouter from "./routes/devices";
import authRoutes from "./routes/auth.routes";
import { config } from "./config";
import { notFoundHandler } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = config.client.url
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("CORS origin check:", origin);

      // CRITICAL: When credentials: true, we MUST return a specific origin string, NEVER true/*

      // In development mode
      if (!config.isProduction) {
        // Allow requests without origin header (Postman, curl, etc.)
        // Return the default client URL as the allowed origin
        if (!origin) {
          const defaultOrigin = config.client.url || "http://localhost:5173";
          console.log("No origin header, allowing:", defaultOrigin);
          return callback(null, defaultOrigin);
        }

        // Allow any localhost or static IP origin in development
        if (
          origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:") ||
          origin.startsWith(`http://${config.server.ip}:`) ||
          allowedOrigins.includes(origin)
        ) {
          console.log("Allowing origin:", origin);
          return callback(null, origin);
        }

        // Reject unknown origins
        console.log("Rejecting origin:", origin);
        return callback(new Error(`Not allowed by CORS: ${origin}`));
      }

      // Production mode: only allow configured origins
      if (!origin) {
        return callback(new Error("Origin header is required in production"));
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, origin);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type"],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());
app.use(morgan(config.isProduction ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health + status
app.get("/health", (_req, res) => res.status(200).send("ok"));
app.use("/health", healthRouter);
app.use("/connection-status", statusRouter);

// API routes
app.use("/api/v1/users", authRoutes);
app.use("/api/v1/devices", deviceRouter);
app.use("/api/v1/data", dataRouter);

// Fallbacks
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
