const knex = require("../database");

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

  async create(request, response) {}

  async all(request, response) {
    const category = await knex("category").select("id", "name").orderBy("id");
    return response.json(category);
  }

  async itemByCategory(request, response) {
    const { id, userId } = request.params;

    const categoryData = await knex("category")
      .select("items.*", "category.name")
      .orderBy("id")
      .leftJoin("items", "category.id", "=", "items.category_id")
      .where("category.id", id);

    let itemsArr = [];

    let itemMoreConsumedName = "";
    let itemMoreConsumedKwh = 0;
    const TE2022 = 0.27;
    const TUSD2022 = 0.4;
    let kwhTotal = 0;
    let totalItemTime = 0;

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
      .leftJoin("items", "items.id", "=", "questions.item_id")
      .leftJoin("users", "users.id", "=", "questions.user_id")
      .where("items.category_id", id)
      .where("questions.user_id", userId);

    item.forEach((element, index) => {
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

      kwhTotal += parseFloat(
        ((quantItem * watts * days * hours) / 1000).toFixed(2)
      );
      totalItemTime += quantItem * days * hours;
      element.totalKwh = parseFloat(
        ((quantItem * watts * days * hours) / 1000).toFixed(2)
      );

      if (element.totalKwh !== 0) {
        /* itemMoreConsumedName = element.item_name;
        itemMoreConsumedKwh = element.totalKwh; */
        if (item.length === 1) {
          itemMoreConsumedName = item[index].item_name;
          itemMoreConsumedKwh = item[index].totalKwh;
          return;
        }
        if (itemMoreConsumedKwh >= item[index].totalKwh) {
          itemMoreConsumedKwh = itemMoreConsumedKwh;
          itemMoreConsumedName = itemMoreConsumedName;
        } else {
          itemMoreConsumedKwh = element.totalKwh;
          itemMoreConsumedName = element.item_name;
        }
      }

      itemsArr.push({
        itemId: element.item_id,
        itemName: element.item_name,
        itemTime: quantItem * days * hours,
        itemKwh: parseFloat(
          ((quantItem * watts * days * hours) / 1000).toFixed(2)
        ),
      });
    });

    return response.json({
      allItensDataByCategory: categoryData,
      itensOfCategory: itemsArr,
      totalItensKwhByCategory: Math.round(kwhTotal),
      totalItemHoursByCategory: totalItemTime,
      totalItensPrice: Number(kwhTotal * TE2022 + kwhTotal * TUSD2022).toFixed(
        2
      ),
      itemMoreConsumedPercentage:
        itemMoreConsumedKwh === 0 && kwhTotal === 0
          ? 0
          : Math.round((itemMoreConsumedKwh * 100) / kwhTotal),
      itemMoreConsumedName: itemMoreConsumedName,
    });
  }
}

module.exports = CategoryController;
