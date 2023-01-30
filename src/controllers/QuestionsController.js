const knex = require("../database");

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

  async rankingUser(request, response) {
    const TE2022 = 0.27;
    const TUSD2022 = 0.4;
    let lastEnergyPay = 0;
    let totalHours = 0;
    let kwhTotal = 0;
    let baseCalculo = 0;
    let wattsLampada = 9;
    let hoursLampada = 6;
    let avatarUser = "";

    let arrUser = [];

    const users = await knex("users").select();

    const item = await knex("questions")
      .select(
        "questions.*",
        "items.default_watts",
        "items.flag_residents",
        "items.id",
        "users.comforts",
        "users.residents",
        "users.energy_bill",
        "users.name",
        "users.avatar"
      )
      .leftJoin("items", "items.id", "=", "questions.item_id")
      .leftJoin("users", "users.id", "=", "questions.user_id");

    users.forEach((user) => {
      avatarUser = "";
      lastEnergyPay = 0;
      totalHours = 0;
      kwhTotal = 0;
      baseCalculo = 0;
      item.forEach((element) => {
        if (element.user_id === user.id) {
          let hours = (element.minutes + element.hours * 60) / 60;
          let days = element.dayByMonth || element.dayByWeek * 4;
          if (element.all_day === 1) {
            days = 30;
            hours = 24;
          }
          let watts = element.default_watts;
          let quantItem = element.quant_item;
          let moradores = element.residents;
          let comodos = element.comforts;
          let flag = element.flag_residents;

          if (quantItem <= 0) {
            quantItem = 0;
          } else {
            if (moradores === 1 && quantItem >= 1) {
              quantItem = moradores;
            }
            if (moradores > 1 && quantItem >= 1) {
              if (flag === 1) {
                if (quantItem === 1) {
                  quantItem = moradores * quantItem;
                } else {
                  quantItem = moradores;
                }
              } else {
                quantItem = quantItem;
                if (quantItem > 1 && moradores > quantItem) {
                  quantItem = quantItem;
                }
                if (moradores <= quantItem) {
                  quantItem = moradores;
                }
              }
            }
          }

          lastEnergyPay = element.energy_bill || 172;

          totalHours += quantItem * days * hours;
          baseCalculo =
            ((comodos / moradores) * wattsLampada * hoursLampada * 30) / 1000;
          let kwhItemMonth = (quantItem * watts * days * hours) / 1000;

          kwhTotal += parseFloat(kwhItemMonth.toFixed(2));
          avatarUser = element.avatar;
        }
      });

      kwhTotal = parseFloat(kwhTotal.toFixed(2));

      kwhTotal = kwhTotal + baseCalculo;
      const imposto = kwhTotal * 0.2;
      const gastoEsperado =
        (kwhTotal + imposto) * TE2022 + (kwhTotal + imposto) * TUSD2022;

      arrUser.push({
        totalKwh: Math.round(kwhTotal),
        totalHours: totalHours,
        valorEsperado: Number(gastoEsperado.toFixed(2)),
        comparePercentage: Math.round(lastEnergyPay / (TE2022 + TUSD2022)),
        economized: lastEnergyPay > Number(gastoEsperado.toFixed(2)),
        valorUltimaConta: lastEnergyPay,
        nome: user.name,
        avatar: avatarUser,
      });
    });

    return response.json(arrUser);
  }
}

module.exports = QuestionsController;
