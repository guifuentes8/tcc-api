const knex = require("../database");

class ItemController {
  async allItem(request, response) {
    const allItems = await knex("items")
      .select("category.name as category_name", "items.*")
      .leftJoin("category", "category.id", "=", "items.category_id")
      .orderBy("category.id", "asc");

    return response.json(allItems);
  }

  async itemById(request, response) {
    const { id } = request.params;

    const item = await knex("items").where({ id }).first();

    return response.json(item);
  }

  async getAllEnergyConsumption(request, response) {
    const { id } = request.params;
    let kwhTotal = 0;
    let baseCalculo = 0;
    let wattsLampada = 9;
    let hoursLampada = 6;
    let imposto = 0;

    const item = await knex("questions")
      .select(
        "questions.*",
        "items.default_watts",
        "items.flag_residents",
        "users.comforts",
        "users.residents"
      )
      .where({ user_id: id })
      .leftJoin("items", "items.id", "=", "questions.item_id")
      .leftJoin("users", "users.id", "=", "questions.user_id");

    /* 
      potencia x horas x dias / 1000
      */
    item.forEach((element) => {
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

      baseCalculo = (comodos * wattsLampada * hoursLampada) / 1000;
      let kwhItemMonth = (quantItem * watts * days * hours) / 1000;

      kwhTotal += parseFloat(kwhItemMonth.toFixed(2));
      // console.log(kwhTotal, parseFloat(kwhItemMonth.toFixed(2)));
    });

    imposto = parseFloat(kwhTotal.toFixed(2)) * 0.2;
    console.log(imposto);

    return response.json({
      totalKwhMes: parseFloat(kwhTotal.toFixed(2)),
    });
  }
}

module.exports = ItemController;
