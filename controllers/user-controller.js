import initKnex from "knex";
import configuration from "../knexfile.js";

const knex = initKnex(configuration);

const index = async (_req, res) => {
  try {
    const data = await knex("users");
    res.status(200).json(data);
  } catch (error) {
    res.status(400).send(`Error retrieving Users: ${error}`);
  }
};

export { index };
