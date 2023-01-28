const { Router } = require("express");

const ItemsController = require("../controllers/ItemsController");

const itemsRoutes = Router();

const itemsController = new ItemsController();

itemsRoutes.get("/", itemsController.allItem);
itemsRoutes.get("/itemById/:id/:userId", itemsController.itemById);
itemsRoutes.get(
  "/allItemByCategory/:categoryId",
  itemsController.allItemByCategory
);
itemsRoutes.get("/dashboard/:id", itemsController.dashboard);

module.exports = itemsRoutes;
