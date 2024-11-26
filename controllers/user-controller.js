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

const findUser = async (req, res) => {
  try {
    const foundUser = await knex("users").where({ id: req.params.id });

    if (foundUser.length === 0) {
      return res.status(404).json(`User with id: ${req.params.id} not found`);
    }

    const userData = foundUser[0];
    res.status(200).json(userData);
  } catch (error) {
    res.status(500).send(`Error retrieving User with id: ${req.params.id}`);
  }
};

export { index, findUser };
