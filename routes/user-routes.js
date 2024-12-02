import express from "express";
const router = express.Router();
import {
  index,
  findUser,
  getUserPosts,
  getUserPost,
  registerUser,
  updateUser,
  deleteUser,
  login,
} from "../controllers/user-controller.js";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder where images will be stored
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique file name
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

router.route("/").get(index);

router.post("/register", upload.single("profile_picture"), registerUser);

router.route("/:id").get(findUser).patch(updateUser).delete(deleteUser);

router.route("/:id/posts").get(getUserPosts);

router.route("/:id/posts/:postId").get(getUserPost);

router.post("/login", login);

export default router;
