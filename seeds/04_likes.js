import likesData from "../seed-data/likes.js";

export async function seed(knex) {
  await knex("likes").del();
  await knex("likes").insert(likesData);
}
