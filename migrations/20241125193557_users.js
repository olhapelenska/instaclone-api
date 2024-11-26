export function up(knex) {
  return knex.schema.createTable("users", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string("user_name").notNullable();
    table.string("email").notNullable();
    table.string("password", 255).notNullable();
    table.string("profile_picture").notNullable();
  });
}

export function down(knex) {
  return knex.schema.dropTable("users");
}
