import express from "express";
const router = express.Router();
import {
  index,
  getComments,
  postComment,
  deleteComment,
  addPost,
  toggleLike,
  deletePost,
} from "../controllers/post-controller.js";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."));
    }
  },
});

router.route("/").get(index).post(upload.single("image_url"), addPost);

router.route("/:id").delete(deletePost);

router.route("/:id/comments").get(getComments).post(postComment);

router.route("/comments/:commentId").delete(deleteComment);

router.route("/:id/likes").post(toggleLike);

export default router;
