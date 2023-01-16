exports.seed = async function (knex) {
  await knex("category").del();
  await knex("category").insert([
    {
      name: "Cozinha",
    },
    {
      name: "Lavanderia",
    },
    {
      name: "Banheiro",
    },
    {
      name: "Eletrodomésticos",
    },
    {
      name: "Eletrônicos",
    },
  ]);
};
