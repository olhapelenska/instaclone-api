import commentsData from "../seed-data/comments.js";

export async function seed(knex) {
  await knex("comments").del();
  await knex("comments").insert(commentsData);
}
