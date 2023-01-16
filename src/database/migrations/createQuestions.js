exports.up = (knex) =>
  knex.schema.createTable("questions", (table) => {
    table.increments("id");
    table.integer("item_id").references("id").inTable("items");
    table.integer("user_id").references("id").inTable("items");
    table.integer("quant_item").notNullable();
    table.boolean("all_day").notNullable();
    table.integer("hours").notNullable();
    table.integer("minutes").notNullable();
    table.integer("dayByMonth").notNullable();
    table.integer("dayByWeek").notNullable();
    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable("questions");
