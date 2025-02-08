import "dotenv/config";

const connection = process.env.JAWSDB_URL || {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: "utf8",
};

console.log(
  "🚀 Database Connection:",
  process.env.JAWSDB_URL ? "Using JawsDB" : "Using Local DB"
);

export default {
  client: "mysql2",
  connection,
};
