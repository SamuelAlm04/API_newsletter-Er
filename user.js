//@ts-check
import { Router } from "express";
import { formatError, knex } from "./server";
export const userRouter = Router({
  mergeParams: true,
});

userRouter.get("/", async (req, res) => {
  const table = knex.select().from("users");
  res.json(await table);
});

userRouter.post("/", async (req, res) => {
  const user = {
    name: req.body.user.name,
    email: req.body.user.email,
    hobby: req.body.user.hobby,
  };
  if (user.name === undefined || user.name === "") {
    return formatError(res, "Campo <name> não preenchido.", 400);
  }
  if (user.email === undefined || user.email === "") {
    return formatError(res, "Campo <email> não preenchido.", 400);
  }
  if (user.hobby === undefined || user.hobby === "") {
    return formatError(res, "Campo <hobby> não preenchido.", 400);
  }
  if (typeof user.name !== "string") {
    return formatError(res, "Campo <name> não é uma string.", 400);
  }
  if (typeof user.email !== "string") {
    return formatError(res, "Campo <email> não é uma string.", 400);
  }
  if (typeof user.hobby !== "string") {
    return formatError(res, "Campo <hobby> não é uma string", 400);
  }
  const validateEmail = (/** @type {string} */ email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };
  if (!validateEmail(user.email)) {
    return formatError(res, "Email inválido.", 400);
  }
  const [dbuser, dbhobby] = await Promise.all([
    knex.from("users").select("email").where("email", user.email).first(),
    knex.from("hobbies").select("id").where("hobby", user.hobby).first(),
  ]);
  if (dbuser) {
    return formatError(res, `Um cadastro já existe para o email ${user.email}`, 409);
  }
  if (!dbhobby) {
    return formatError(res, "Hobby inválido", 400);
  }
  user.hobby = dbhobby.id;
  const resUser = await knex("users").insert(user).returning("*");
  res.json(resUser);
});

userRouter.put("/:id", async (req, res) => {
  const userID = req.params.id;
  let tempVar = await knex.from("users").select().where("id", userID);
  if (tempVar.length == 0) {
    return formatError(res, "ID não cadastrada na database.", 404);
  }
  const user = {
    name: req.body.user.name,
    email: req.body.user.email,
    hobby: req.body.user.hobby,
  };
  if (user.name === undefined || user.name === "") {
    return formatError(res, "Campo <name> não preenchido.", 400);
  }
  if (user.email === undefined || user.email === "") {
    return formatError(res, "Campo <email> não preenchido.", 400);
  }
  if (user.hobby === undefined || user.hobby === "") {
    return formatError(res, "Campo <hobby> não preenchido.", 400);
  }
  if (typeof user.name !== "string") {
    return formatError(res, "Campo <name> não é uma string.", 400);
  }
  if (typeof user.email !== "string") {
    return formatError(res, "Campo <email> não é uma string.", 400);
  }
  if (typeof user.hobby !== "string") {
    return formatError(res, "Campo <hobby> não é uma string", 400);
  }
  const validateEmail = (/** @type {string} */ email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };
  if (validateEmail(user.email) != true) {
    return formatError(res, "Email inválido.", 400);
  }
  tempVar = await knex.from("hobbies").select().where("hobby", user.hobby);
  if (tempVar.length == 0) {
    return formatError(res, "Hobby inválido", 400);
  }
  user.hobby = tempVar[0].id;
  await knex("users").where("id", userID).update(user);
  tempVar = await knex.from("users").select().where("id", userID).first();
  res.json(tempVar);
});

userRouter.delete("/:id", async (req, res) => {
  const userID = req.params.id;
  let tempVar = await knex.from("users").select().where("id", userID).first();
  if (!tempVar) {
    return formatError(res, "ID não cadastrada na database.", 404);
  }
  await knex("deleted").insert(tempVar);
  await knex("users").where("id", userID).del();
  res.json(true);
});

userRouter.get("/:id", async (req, res) => {
  const userID = req.params.id;
  const tempVar = await knex.from("users").select().where("id", userID).first();
  if (!tempVar) {
    return formatError(res, "ID não cadastrada na database.", 404);
  }
  res.json(tempVar);
});

userRouter.get("/:id/context", async (req, res) => {
  const userID = req.params.id;
  const tempVar = await knex.from("users").select().where("id", userID).first();
  if (!tempVar) {
    return formatError(res, "ID não cadastrada na database.", 404);
  }
  tempVar.hobby = await knex.from("hobbies").select().where("id", tempVar.hobby).first();
  res.json(tempVar);
});
