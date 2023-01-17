exports.up = (knex) =>
  knex.schema.createTable("questions", (table) => {
    table.increments("id");
    table.integer("item_id").references("id").inTable("items");
    table.integer("user_id").references("id").inTable("items");
    table.integer("quant_item").notNullable().default(0);
    table.boolean("all_day");
    table.integer("hours");
    table.integer("minutes");
    table.integer("dayByMonth");
    table.integer("dayByWeek");
    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable("questions");
