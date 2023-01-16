const { Router } = require("express");

const ItemsController = require("../controllers/ItemsController");

const itemsRoutes = Router();

const itemsController = new ItemsController();

itemsRoutes.get("/", itemsController.allItem);
itemsRoutes.get("/:id", itemsController.itemById);
itemsRoutes.get(
  "/getAllEnergyConsumption/:id",
  itemsController.getAllEnergyConsumption
);

module.exports = itemsRoutes;
