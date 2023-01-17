const AppError = require("../utils/AppError");
const knex = require("../database");
const dayjs = require("dayjs");

class CategoryController {
  async index(request, response) {
    const category = await knex("category").select("id", "name").orderBy("id");
    const items = await knex("items").orderBy("id");

    const categoryIndex = category.map((cat) => {
      return {
        title: cat.name,
        data: items.filter((item) => {
          if (item.category_id === cat.id) {
            return item;
          }
        }),
      };
    });

    return response.json(categoryIndex);
  }

  async create(request, response) {
    const { exercise_id } = request.body;
    const user_id = request.user.id;

    if (!exercise_id) {
      throw new AppError("Informe o id do exercício.");
    }

    await knex("history").insert({ user_id, exercise_id });

    return response.status(201).json();
  }
}

module.exports = CategoryController;
