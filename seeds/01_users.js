import usersData from "../seed-data/users.js";

export async function seed(knex) {
  await knex("users").del();
  await knex("users").insert(usersData);
}
