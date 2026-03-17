import "dotenv/config";
import { connectDB } from "./config/db.js";
import { app } from "./app.js";

/*
  PORT CONFIG
*/
const PORT = process.env.PORT || 5000;

/*
  HEALTH CHECK ROUTE
*/
app.get("/", (req, res) => {
  res.send("Server is running");
});

/*
  START SERVER
*/
const startServer = async () => {
  try {
    // Connect to DB first
    await connectDB();

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

    /*
      Graceful shutdown (optional but good practice)
    */
    process.on("SIGINT", () => {
      console.log("Shutting down server...");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });

  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();