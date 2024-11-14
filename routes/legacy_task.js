const express = require("express");
const router = express.Router();

const sql = require("../core/sql");

router.get("/", async (req, res) => {
  try {
    const result = await sql.query(
      "SELECT id, title, done, description, `due-date`, `creation-date`, `update-date`, type FROM task"
    );
    res.json(result);
  } catch (ex) {
    console.error(ex);
    res.status(500).send("Erreur serveur");
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await sql.query(
      `SELECT id, title, done, description, \`due-date\`, \`creation-date\`, \`update-date\`, type FROM task WHERE id =${id}`
    );
    res.json(result);
  } catch (ex) {
    console.error(ex);
    res.status(500).send("Erreur serveur");
  }
});

router.post("/", async (req, res) => {
  const { title, description, dueDate, type } = req.body;

  const newTask = {
    title,
    description,
    dueDate,
    type,
  };

  try {
    const selectType = await sql.query(
      `SELECT id FROM type WHERE title="${newTask.type}"`
    );

    if (!selectType[0]) {
      res.status(404).send("Ce type de tâche n'existe pas.");
      return;
    }

    const typeId = selectType[0].id;

    const insertResult = await sql.query({
      sql: "INSERT INTO task (title, description, `due-date`, type) VALUES (?, ?, ?, ?)",
      values: [newTask.title, newTask.description, newTask.dueDate, typeId],
    });

    const newTaskId = insertResult.insertId;

    const postedTask = await sql.query(
      `SELECT id, title, done, description, \`due-date\`, \`creation-date\`, \`update-date\`, type FROM task WHERE id =${newTaskId}`
    );
    res.json(postedTask);
  } catch (ex) {
    console.error(ex);
    res.status(500).send("Erreur serveur");
  }
});

module.exports = router;
