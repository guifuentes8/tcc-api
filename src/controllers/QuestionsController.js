const AppError = require("../utils/AppError");
const knex = require("../database");
const dayjs = require("dayjs");

class QuestionsController {
  async index(request, response) {
    const { id, userId } = request.params;

    const selectItem = await knex("items")
      .select("items.*", "category.name as cat_name")
      .where("items.id", id)
      .leftJoin("category", "items.category_id", "=", "category.id");

    const selectQuestion = await knex("questions")
      .select("questions.*", "items.*", "category.name as cat_name")
      .where("questions.item_id", id)
      .leftJoin("items", "items.id", "=", "questions.item_id")
      .leftJoin("category", "items.category_id", "=", "category.id")
      .leftJoin("users", "users.id", "=", "questions.user_id")
      .where("questions.user_id", userId);

    if (selectQuestion.length > 0) return response.json(selectQuestion);

    return response.json(selectItem);
  }

  async create(request, response) {
    const { userId, questions } = request.body;

    console.log(questions);

    await knex("questions").insert(questions);

    await knex("users")
      .where({ id: userId })
      .update({ reply_questionary: true });

    return response.status(201).json();
  }

  async update(request, response) {
    const { userId, itemId, question } = request.body;

    const selectQuestion = await knex("questions")
      .select()
      .where("questions.item_id", itemId)
      .where("questions.user_id", userId);

    if (selectQuestion.length > 0) {
      await knex("questions")
        .where("questions.user_id", userId)
        .where("questions.item_id", itemId)
        .update(question);
    } else {
      await knex("questions").insert(question);
    }

    return response.status(201).json();
  }

  async updateUser(request, response) {
    const { userId, questions } = request.body;

    await knex("users").where({ id: userId }).update(questions);

    return response.status(201).json();
  }
}

module.exports = QuestionsController;
