const { Router } = require("express");

const QuestionsController = require("../controllers/QuestionsController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const questionsRoutes = Router();

const questionsController = new QuestionsController();

// questionsRoutes.use(ensureAuthenticated);

questionsRoutes.get("/:id/:userId", questionsController.index);
questionsRoutes.get("/ranking", questionsController.rankingUser);
questionsRoutes.post("/", questionsController.create);
questionsRoutes.post("/update", questionsController.update);
questionsRoutes.post("/user", questionsController.updateUser);

module.exports = questionsRoutes;
