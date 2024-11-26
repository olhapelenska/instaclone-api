import express from "express";
const router = express.Router();
import { index, findUser } from "../controllers/user-controller.js";

router.route("/").get(index);

router.route("/:id").get(findUser);

export default router;
