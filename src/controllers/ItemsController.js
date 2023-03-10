const knex = require("../database");

class ItemController {
  async allItem(request, response) {
    const allItems = await knex("items")
      .select("category.name as category_name", "items.*")
      .leftJoin("category", "category.id", "=", "items.category_id")
      .orderBy("category.id", "asc");

    return response.json(allItems);
  }

  async allItemByCategory(request, response) {
    const { categoryId } = request.params;

    const allItems = await knex("items")
      .select("items.*")
      .orderBy("items.id", "asc")
      .where("items.category_id", categoryId);

    return response.json(allItems);
  }

  async itemById(request, response) {
    const { id, userId } = request.params;
    const item = await knex("items")
      .select("items.*", "questions.*", "users.*")
      .leftJoin("questions", "items.id", "=", "questions.item_id")
      .leftJoin("users", "users.id", "=", "questions.user_id")
      .where("items.id", id)
      .where("questions.user_id", userId);

    if (item.length === 0) {
      return response.json({
        total: 0,
        valorEsperado: 0,
        totalHours: 0,
      });
    }

    const TE2022 = 0.27;
    const TUSD2022 = 0.4;
    let totalHours = 0;
    let kwhTotal = 0;

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
      totalHours += quantItem * days * hours;
      let kwhItemMonth = (quantItem * watts * days * hours) / 1000;

      kwhTotal += parseFloat(kwhItemMonth.toFixed(2));
    });
    const imposto = kwhTotal * 0.2;

    const gastoEsperado =
      (kwhTotal + imposto) * TE2022 + (kwhTotal + imposto) * TUSD2022;

    return response.json({
      total: Math.round(kwhTotal),
      valorEsperado: Number(gastoEsperado.toFixed(2)),
      totalHours: Math.round(totalHours),
    });
  }

  async moreConsumed(request, response) {
    const { id } = request.params;

    const item = await knex("items").select("items.*").where({ id }).first();

    return response.json(item);
  }

  async dashboard(request, response) {
    const { id } = request.params;

    let itemsArr = [];

    const TE2022 = 0.27;
    const TUSD2022 = 0.4;
    let lastEnergyPay = 0;
    let totalHours = 0;
    let kwhTotal = 0;
    let baseCalculo = 0;
    let wattsLampada = 9;
    let hoursLampada = 6;

    let photo = "";
    let auxItem = 0;
    let itemName = "";

    const item = await knex("questions")
      .select(
        "questions.*",
        "items.default_watts",
        "items.flag_residents",
        "items.name as item_name",
        "items.photo",
        "items.id as item_id",
        "users.comforts",
        "users.residents",
        "users.energy_bill"
      )
      .where("questions.user_id", id)
      .leftJoin("items", "items.id", "=", "questions.item_id")
      .leftJoin("users", "users.id", "=", "questions.user_id");

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

      itemsArr.push({
        itemId: element.item_id,
        itemName: element.item_name,
        itemWattsMonth: parseFloat(kwhItemMonth.toFixed(2)),
        userId: element.user_id,
      });

      auxItem = kwhItemMonth < auxItem ? auxItem : kwhItemMonth;
      if (auxItem === kwhItemMonth) {
        photo = element.photo;
        itemName = element.item_name;
      }
    });

    kwhTotal = parseFloat(kwhTotal.toFixed(2));

    kwhTotal = kwhTotal + baseCalculo;

    const imposto = kwhTotal * 0.2;
    const itemPercentageOfTotal = (auxItem * 100) / kwhTotal;
    const gastoEsperado =
      (kwhTotal + imposto) * TE2022 + (kwhTotal + imposto) * TUSD2022;
    const newItemsArr = itemsArr.map((element) => {
      element.percentage = (element.itemWattsMonth * 100) / kwhTotal;
      element.percentage = Number(element.percentage.toFixed(2));
      return element;
    });

    const impostoReverso = lastEnergyPay * 0.2;

    return response.json({
      total: Math.round(kwhTotal),
      comparePercentage: Math.round(
        (lastEnergyPay - impostoReverso + baseCalculo) / (TE2022 + TUSD2022)
      ),
      itemPhoto: photo,
      itemName: itemName,
      itemPercentageOfTotal: Math.round(itemPercentageOfTotal),
      economized: lastEnergyPay > Number(gastoEsperado.toFixed(2)),
      isLight: kwhTotal === baseCalculo,
      valorEsperado: Number(gastoEsperado.toFixed(2)),
      valorUltimaConta: lastEnergyPay,
      itens: newItemsArr,
      totalHours: totalHours,
    });
  }
}

module.exports = ItemController;
