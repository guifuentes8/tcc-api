const { Router } = require("express");

const CategoryController = require("../controllers/CategoryController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const categoryRoutes = Router();

const categoryController = new CategoryController();

// categoryRoutes.use(ensureAuthenticated);

categoryRoutes.get("/", categoryController.index);
categoryRoutes.post("/", categoryController.create);

module.exports = categoryRoutes;
