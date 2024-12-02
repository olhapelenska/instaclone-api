import initKnex from "knex";
import configuration from "../knexfile.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const knex = initKnex(configuration);

const index = async (_req, res) => {
  try {
    const data = await knex("users");
    res.status(200).json(data);
  } catch (error) {
    res.status(400).send(`Error retrieving Users: ${error}`);
  }
};

const findUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await knex("users")
      .where({ id: userId })
      .select("id", "user_name", "profile_picture")
      .first();

    if (!user) {
      return res
        .status(404)
        .json({ message: `User with id ${userId} not found` });
    }

    const posts = await knex("posts")
      .where({ user_id: userId })
      .select("id", "user_id", "image_url");

    const savedPosts = await knex("saved-posts")
      .join("posts", "saved-posts.post_id", "posts.id")
      .where("saved-posts.user_id", userId)
      .select("posts.id", "posts.user_id", "posts.image_url");

    user.posts = posts;
    user.savedPosts = savedPosts;

    res.status(200).json(user);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res
      .status(500)
      .json({ message: `Error retrieving user: ${error.message}` });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const posts = await knex("users")
      .join("posts", "posts.user_id", "users.id")
      .where({ user_id: req.params.id });

    res.json(posts);
  } catch (error) {
    res.status(500).json({
      message: `Unable to retrieve posts for user with ID ${req.params.id}: ${error}`,
    });
  }
};

const getUserPost = async (req, res) => {
  const { postId, id } = req.params;

  try {
    const post = await knex("users")
      .join("posts", "posts.user_id", "users.id")
      .select(
        "posts.id",
        "posts.image_url",
        "posts.description",
        "posts.created_at",
        "posts.updated_at",
        "users.id as user_id",
        "users.user_name",
        "users.profile_picture"
      )
      .where({ "posts.id": postId, "users.id": id })
      .first();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await knex("comments")
      .join("users", "comments.user_id", "users.id")
      .select(
        "comments.id",
        "comments.comment",
        "users.user_name",
        "users.profile_picture"
      )
      .where({ "comments.post_id": postId });

    const likesCount = await knex("likes")
      .where({ post_id: postId })
      .count("id as count")
      .first();

    res.json({
      ...post,
      comments: comments || [],
      likes_count: likesCount?.count || 0,
    });
  } catch (error) {
    res.status(500).json({
      message: `Unable to retrieve post with ID ${postId} for user with ID ${id}: ${error}`,
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const [newUserId] = await knex("users").insert({
      user_name: req.body.user_name,
      email: req.body.email,
      password: hashedPassword,
      profile_picture: "/uploads/default-profile.png",
    });
    const newUser = await knex("users").where({ id: newUserId }).first();
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ message: "User with this email already exists" });
    } else {
      res
        .status(500)
        .json({ message: `Error registering user: ${error.message}` });
    }
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;

  const profile_picture = req.file ? req.file.path : undefined;

  try {
    const updatedData = { ...req.body };
    if (profile_picture) {
      updatedData.profile_picture = profile_picture;
    }

    const updatedRows = await knex("users").where({ id }).update(updatedData);

    if (updatedRows === 0) {
      return res.status(404).json({ message: `User with id ${id} not found` });
    }

    const updatedUser = await knex("users").where({ id });
    res.json(updatedUser);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Unable to update user with id ${id}: ${error}` });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const rowsDeleted = await knex("users").where({ id: id }).delete();

    if (rowsDeleted === 0) {
      res.status(404).json({ message: `User with id ${id} not found` });
    }
    res.status(204);
  } catch (error) {
    res.status(500).json({ message: `Unable to delete user ${id} : ${error}` });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await knex("users").where({ email }).first();
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        user_name: user.user_name,
        profile_picture: user.profile_picture,
      },
    });
  } catch (error) {
    res.status(500).json({ message: `Error logging in: ${error}` });
  }
};

export {
  index,
  findUser,
  getUserPosts,
  getUserPost,
  registerUser,
  updateUser,
  deleteUser,
  login,
};
