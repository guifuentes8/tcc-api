exports.up = (knex) =>
  knex.schema.createTable("items", (table) => {
    table.increments("id");
    table.integer("category_id").references("id").inTable("category");
    table.text("name").notNullable();
    table.text("photo").notNullable();
    table.text("input_name").notNullable();
    table.float("default_watts").notNullable();
    table.integer("max_select_range").notNullable();
    table.boolean("flag_residents").notNullable();
    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable("items");
