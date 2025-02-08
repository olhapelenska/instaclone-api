import express from "express";
import userRoutes from "./routes/user-routes.js";
import postRoutes from "./routes/post-routes.js";
import cors from "cors";
import authenticateToken from "./middleware/auth-middleware.js";

const app = express();
const PORT = process.env.PORT || 5050;

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.use((req, res, next) => {
  const publicRoutes = ["/api/users/login", "/api/users/register"];
  if (publicRoutes.includes(req.path)) {
    return next();
  }
  authenticateToken(req, res, next);
});

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
