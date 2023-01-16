const { Router } = require("express");

const usersRouter = require("./users.routes");
const sessionsRouter = require("./sessions.routes");
const itemsRouter = require("./items.routes");
const questionsRouter = require("./questions.routes");
const categoryRouter = require("./category.routes");

const routes = Router();

routes.use("/users", usersRouter);
routes.use("/sessions", sessionsRouter);
routes.use("/items", itemsRouter);
routes.use("/questions", questionsRouter);
routes.use("/category", categoryRouter);

module.exports = routes;
