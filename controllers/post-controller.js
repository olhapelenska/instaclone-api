import initKnex from "knex";
import configuration from "../knexfile.js";

const knex = initKnex(configuration);

const index = async (req, res) => {
  const userId = req.user.id;

  try {
    const posts = await knex("posts")
      .join("users", "posts.user_id", "users.id")
      .select(
        "posts.id",
        "posts.user_id",
        "posts.image_url",
        "posts.description",
        "posts.created_at",
        "posts.updated_at",
        "users.user_name",
        "users.profile_picture"
      );

    const likes = await knex("likes")
      .select(
        "likes.post_id",
        knex.raw("COUNT(likes.id) AS likes_count"),
        knex.raw(
          `MAX(CASE WHEN likes.user_id = ? THEN 1 ELSE 0 END) AS is_liked`,
          [userId]
        )
      )
      .groupBy("likes.post_id");

    const comments = await knex("comments")
      .leftJoin("users", "comments.user_id", "users.id")
      .select(
        "comments.post_id",
        knex.raw("COUNT(comments.id) AS comments_count"),
        knex.raw(`
          COALESCE(
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', comments.id,
                'comment', comments.comment,
                'user_name', users.user_name
              )
            ), '[]'
          ) AS comments
        `)
      )
      .groupBy("comments.post_id");

    const postsWithDetails = posts.map((post) => {
      const postLikes = likes.find((like) => like.post_id === post.id) || {
        likes_count: 0,
        is_liked: 0,
      };

      const postComments = comments.find((c) => c.post_id === post.id) || {
        comments_count: 0,
        comments: [],
      };

      return {
        ...post,
        likes_count: postLikes.likes_count,
        is_liked: Boolean(postLikes.is_liked),
        comments_count: postComments.comments_count,
        comments: Array.isArray(postComments.comments)
          ? postComments.comments
          : JSON.parse(postComments.comments || "[]"),
      };
    });

    res.status(200).json(postsWithDetails);
  } catch (error) {
    console.error("Error retrieving Posts:", error);
    res.status(400).json({ message: "Error retrieving Posts", error });
  }
};

const addPost = async (req, res) => {
  const { user_id, description } = req.body;

  if (!user_id || !description) {
    return res.status(400).json({
      message: "Please provide a user ID and description for the post",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      message: "An image is required to create a post",
    });
  }

  const image_url = `/uploads/${req.file.filename}`;

  try {
    const result = await knex("posts").insert({
      user_id,
      description,
      image_url,
    });

    const newPostId = result[0];
    const createdPost = await knex("posts").where({ id: newPostId });
    res.status(200).json(createdPost);
  } catch (error) {
    res.status(500).json({ message: `Cannot create a new post: ${error}` });
  }
};

const getComments = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await knex("comments").where({ post_id: id });
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: `Error retrieving comments ${error}` });
  }
};

const postComment = async (req, res) => {
  const { id: post_id } = req.params;
  const { user_id, comment } = req.body;

  console.log("Request Params:", req.params);
  console.log("Request Body:", req.body);

  if (!user_id || !post_id || !comment) {
    console.log("Missing data:", { user_id, post_id, comment });
    return res.status(400).json({ message: "Please provide all the data" });
  }

  try {
    const [newCommentId] = await knex("comments").insert({
      post_id,
      user_id,
      comment,
    });

    const newComment = await knex("comments")
      .leftJoin("users", "comments.user_id", "users.id")
      .select("comments.id", "comments.comment", "users.user_name")
      .where("comments.id", newCommentId)
      .first();

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: `Unable to create a comment: ${error}` });
  }
};
const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    const comment = await knex("comments")
      .join("posts", "comments.post_id", "posts.id")
      .where("comments.id", commentId)
      .select("posts.user_id as postOwnerId")
      .first();

    if (!comment) {
      return res
        .status(404)
        .json({ message: `Comment with ID ${commentId} not found` });
    }

    if (comment.postOwnerId !== userId) {
      return res.status(403).json({
        message:
          "Access denied. You can only delete comments on your own posts.",
      });
    }

    const rowsDeleted = await knex("comments")
      .where({ id: commentId })
      .delete();

    if (rowsDeleted === 0) {
      return res
        .status(404)
        .json({ message: `Comment with ID ${commentId} not found` });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      message: `Unable to delete comment: ${error}`,
    });
  }
};

const savePost = async (req, res) => {
  if (!req.body.user_id) {
    return res.status(400).json({
      message: "Please provide user id",
    });
  }
  try {
    const result = await knex("saved-posts").insert(req.body);

    const newSavedPostId = result[0];
    const newSavedPost = await knex("saved-posts").where({
      id: newSavedPostId,
    });

    res.status(201).json(newSavedPost);
  } catch (error) {
    res.status(500).json({
      message: `Unable to save post: ${error}`,
    });
  }
};

const unsavePost = async (req, res) => {
  const { id, user_id } = req.params;

  try {
    const rowsDeleted = await knex("saved-posts")
      .where({ post_id: id, user_id })
      .delete();

    if (rowsDeleted === 0) {
      return res.status(404).json({
        message: `Saved post with ID ${id} not found for user ${user_id}`,
      });
    }

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      message: `Unable to unsave post: ${error}`,
    });
  }
};

const toggleLike = async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user.id;

  try {
    const existingLike = await knex("likes")
      .where({ post_id: postId, user_id: userId })
      .first();

    if (existingLike) {
      await knex("likes").where({ post_id: postId, user_id: userId }).delete();

      return res.status(200).json({ message: "Like removed" });
    } else {
      await knex("likes").insert({
        post_id: postId,
        user_id: userId,
      });

      return res.status(201).json({ message: "Like added" });
    }
  } catch (error) {
    res.status(500).json({ message: `Error toggling like: ${error.message}` });
  }
};

const deletePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const post = await knex("posts").where({ id }).first();
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user_id !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post" });
    }

    await knex("posts").where({ id }).delete();

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Unable to delete post: ${error.message}` });
  }
};

export {
  index,
  getComments,
  postComment,
  deleteComment,
  savePost,
  unsavePost,
  addPost,
  toggleLike,
  deletePost,
};
