const { Router } = require("express");

const CategoryController = require("../controllers/CategoryController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const categoryRoutes = Router();

const categoryController = new CategoryController();

// categoryRoutes.use(ensureAuthenticated);

categoryRoutes.get("/", categoryController.index);
categoryRoutes.get("/all", categoryController.all);
categoryRoutes.get(
  "/itemByCategory/:id/:userId",
  categoryController.itemByCategory
);
categoryRoutes.post("/", categoryController.create);

module.exports = categoryRoutes;
