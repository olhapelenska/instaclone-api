import "dotenv/config";
import express from "express";
import userRoutes from "./routes/user-routes.js";
import postRoutes from "./routes/post-routes.js";

const app = express();
const PORT = process.env.PORT || 5050;

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.listen(PORT, () => {
  console.log(`running at http://localhost:${PORT}`);
});
