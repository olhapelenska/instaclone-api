import savedPosts from "../seed-data/saved-posts.js";

export async function seed(knex) {
  await knex("saved-posts").del();
  await knex("saved-posts").insert(savedPosts);
}
