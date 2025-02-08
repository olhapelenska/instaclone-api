const connection =
  process.env.JAWSDB_URL ||
  (process.env.NODE_ENV === "development"
    ? {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        charset: "utf8",
      }
    : null);

export default {
  client: "mysql2",
  connection,
};
