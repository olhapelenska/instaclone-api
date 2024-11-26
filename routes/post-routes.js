import express from "express";
const router = express.Router();
import { index } from "../controllers/post-controller.js";

router.route("/").get(index);

export default router;
