import express from "express";
import { userRouter } from "./user";
import cors from "cors";
export const server = express();
const port = 3001;

export const knex = require("knex")({
  client: "sqlite3",
  useNullAsDefault: true,
  connection: {
    filename: "./database.sqlite3",
  },
});

server.use(express.json());

server.use(cors({ origin: "*", credentials: false }));

export function formatError(res, text, n) {
  const errorReport = {
    message: text,
    code: n,
  };
  res.status(n);
  return res.json(errorReport);
}

server.get("/health", (req, res) => {
  return formatError(res, "Ok.", 200);
});

server.get("/hobby", async (req, res) => {
  const stuff = await knex.from("hobbies").select();
  res.json(stuff);
});

server.post("/hobby", async (req, res) => {
  if (!req.body.hobby || typeof req.body.hobby !== "object") {
    return formatError(res, "hobby invalido", 400);
  }
  const hobby = {
    hobby: req.body.hobby.name,
    description: req.body.hobby.description,
  };
  if (await knex.from("hobbies").select().where("hobby", hobby.hobby).first()) {
    return formatError(res, "Já existe um cadastro para este hobby na database", 409);
  }
  if (typeof hobby.hobby != "string" || hobby.hobby == "") {
    return formatError(res, "Hobby inválido.", 400);
  }
  if (typeof hobby.description != "string" || hobby.description == "") {
    return formatError(res, "Descrição inválida.", 400);
  }
  const resp = await knex("hobbies").insert(hobby).returning("*");
  res.json(resp);
});

server.put("/hobby/:id", async (req, res) => {
  const hobbyID = req.params.id;
  let tempVar = await knex.from("hobbies").select().where("id", hobbyID).first();
  if (!tempVar) {
    return formatError(res, "ID não cadastrada na database.", 404);
  }
  const hobby = {
    hobby: req.body.hobby.name,
    description: req.body.hobby.description,
  };
  if (await knex.from("hobbies").select().where("hobby", hobby.hobby).first()) {
    return formatError(res, "Já existe um cadastro para este hobby na database", 409);
  }
  if (typeof hobby.hobby != "string" || hobby.hobby == "") {
    return formatError(res, "Hobby inválido.", 400);
  }
  if (typeof hobby.description != "string" || hobby.description == "") {
    return formatError(res, "Descrição inválida.", 400);
  }
  await knex("hobbies").where("id", hobbyID).update(hobby);
  tempVar = await knex.from("hobbies").select().where("id", hobbyID).first();
  res.json(tempVar);
});

server.delete("/hobby/:id", async (req, res) => {
  const hobbyID = req.params.id;
  let tempVar = await knex.from("hobbies").select().where("id", hobbyID).first();
  if (!tempVar) {
    return formatError(res, "ID não cadastrada na database.", 404);
  }
  await knex("hobbies").where("id", hobbyID).del();
  res.json(true);
});

server.use(userRouter);

server.listen(port, async () => {
  const insertFunc = async () => {
    const golfe = {
      hobby: "Golfe",
      description:
        "Esporte onde os jogadores usam tacos para acertar bolas em buracos no menor número possível de tacadas",
    };
    const futebol = {
      hobby: "Futebol",
      description:
        "Esporte de equipe onde os jogadores chutam uma bola para marcar gols no gol do adversário.",
    };
    const basquete = {
      hobby: "Basquete",
      description:
        "Esporte de equipe onde os jogadores arremessam uma bola em uma cesta elevada para marcar pontos.",
    };
    const volei = {
      hobby: "Vôlei",
      description:
        "Esporte de equipe onde os jogadores batem uma bola por cima de uma rede para marcar pontos no lado adversário.",
    };
    const natacao = {
      hobby: "Natação",
      description:
        "Atividade esportiva onde os atletas competem nadando em diferentes estilos e distâncias em uma piscina.",
    };
    const all = [golfe, futebol, basquete, volei, natacao];
    await knex("hobbies").insert(all);
  };
  knex.schema.hasTable("users").then(async function (exists) {
    if (!exists) {
      return knex.schema.createTableIfNotExists("users", function (table) {
        table.increments();
        table.string("name");
        table.string("email");
        table.integer("hobby");
      });
    }
  });
  knex.schema.hasTable("hobbies").then(async function (exists) {
    if (!exists) {
      return knex.schema.createTableIfNotExists("hobbies", function (table) {
        table.increments();
        table.string("hobby");
        table.string("description");
        insertFunc();
      });
    }
  });
  knex.schema.hasTable("deleted").then(async function (exists) {
    if (!exists) {
      return knex.schema.createTableIfNotExists("deleted", function (table) {
        table.integer("id");
        table.string("name");
        table.string("email");
        table.integer("hobby");
      });
    }
  });

  console.log(`Server listening on port ${port}`);
});
