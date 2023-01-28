exports.up = (knex) =>
  knex.schema.createTable("questions", (table) => {
    table.increments("id");
    table.integer("item_id").references("id").inTable("items");
    table.integer("user_id").references("id").inTable("items");
    table.integer("quant_item").notNullable().default(0);
    table.boolean("all_day").notNullable().default(0);
    table.integer("hours").notNullable().default(0);
    table.integer("minutes").notNullable().default(0);
    table.integer("dayByMonth").notNullable().default(0);
    table.integer("dayByWeek").notNullable().default(0);
    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable("questions");
