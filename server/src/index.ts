// import { config } from "./config"; // centralized config
// import app from "./app"; // Express app
// import { connectWebSocket } from "./websocket";
// import { initDB } from "./db";

// async function main() {
//   try {
//     // Initialize database and tables
//     await initDB();

//     // Connect WebSocket
//     connectWebSocket();

//     // Start Express server
//     app.listen(config.server.port, () => {
//       console.log(
//         `🚀 API server running at http://localhost:${config.server.port}`
//       );
//     });
//   } catch (error) {
//     console.error("❌ Failed to start server:", error);
//     process.exit(1);
//   }
// }

// // Run main function
// main();
// ======================================
// src/index.ts
import { config } from "./config";
import app from "./app";
import { connectWebSocket } from "./websocket";
import { initDB } from "./db";

async function bootstrap() {
  try {
    await initDB();
    // Start WebSocket connection (non-blocking - failures won't stop the server)
    try {
      connectWebSocket();
    } catch (wsError) {
      console.error(
        "⚠️ WebSocket initialization error (server will continue):",
        wsError,
      );
      // Don't exit - server should continue running even if WebSocket fails
    }

    const server = app.listen(config.server.port, "0.0.0.0", () => {
      console.log(
        `🚀 API server running at http://${config.server.ip}:${config.server.port} (${config.env.NODE_ENV})`,
      );
    });

    // Only exit on critical server errors (port binding issues, etc.)
    // WebSocket connection failures should not stop the server
    server.on("error", (err: Error) => {
      console.error("❌ Critical server error:", err);
      // Only exit if it's a critical error like port already in use
      if ((err as any).code === "EADDRINUSE") {
        console.error("❌ Port already in use. Exiting...");
        process.exit(1);
      } else {
        console.error("⚠️ Server error occurred, but continuing to run...");
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();

process.on("unhandledRejection", (reason) => {
  console.error("⚠️ Unhandled Promise rejection:", reason);
  // Don't exit - log and continue
});

process.on("uncaughtException", (error) => {
  console.error("⚠️ Uncaught Exception:", error);
  // Don't exit - log and continue (unless it's a critical error)
  // Only exit for truly critical errors that would make the server unusable
});
