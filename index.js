import express from "express";
import userRoutes from "./routes/user-routes.js";
import postRoutes from "./routes/post-routes.js";
import cors from "cors";
import authenticateToken from "./middleware/auth-middleware.js";
import knex from "./knexfile.js"; // Ensure this points to your Knex config

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Authenticate all routes except login/register
app.use((req, res, next) => {
  const publicRoutes = ["/api/users/login", "/api/users/register"];
  if (publicRoutes.includes(req.path)) {
    return next();
  }
  authenticateToken(req, res, next);
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Run Migrations & Seed Data Before Starting Server
const startServer = async () => {
  try {
    console.log("⏳ Running Migrations...");
    await knex.migrate.latest();
    console.log("✅ Migrations Applied!");

    console.log("⏳ Seeding Data (only if needed)...");
    const users = await knex("users").select("*").limit(1);
    if (users.length === 0) {
      await knex.seed.run();
      console.log("✅ Seed Data Inserted!");
    } else {
      console.log("⚠️ Skipping Seed: Data already exists.");
    }

    // Start Server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error running migrations or seeds:", error);
    process.exit(1); // Stop deployment if migration fails
  }
};

// Start the server with migrations
startServer();
