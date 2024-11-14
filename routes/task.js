const express = require("express");
const router = express.Router();
const { Type, Task } = require("../models");
const { Op, where } = require("sequelize");

// TODO : RETOURNER L'OBJET TYPE (AVEC SON ID ET SON TITRE)
// Récupérer les données dans les 2 tables (il existe une méthode faite pour, cf. doc sequelize)
router.get("/", async (req, res) => {
  const filterQueries = req.query;
  let totalTasks = 0;
  let tasksPerPage = 20;
  let currentPage = 1;

  tasksPerPage = parseInt(filterQueries.tasksPerPage, 10) || tasksPerPage;
  currentPage = parseInt(filterQueries.page, 10) || currentPage;

  const whereClause = {
    ...(filterQueries.title && {
      title: { [Op.substring]: filterQueries.title },
    }),
    ...(filterQueries.isDone && { done: filterQueries.isDone === "true" }),
    ...(filterQueries.isLate && {
      dueDate:
        filterQueries.isLate === "true"
          ? { [Op.lt]: new Date() }
          : { [Op.gte]: new Date() },
      done: false,
    }),
  };

  try {
    const tasks = await Task.findAll({
      attributes: [
        "id",
        "title",
        "done",
        "description",
        "dueDate",
        "createdAt",
        "updatedAt",
        "TypeId",
      ],
      where: Object.keys(whereClause).length ? whereClause : undefined,
      offset: (currentPage - 1) * tasksPerPage,
      limit: tasksPerPage,
    });

    totalTasks = tasks.length;

    const response = {
      tasksPerPage,
      totalTasks,
      tasks,
    };

    res.json(response);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// TODO : RETOURNER L'OBJET TYPE (AVEC SON ID ET SON TITRE)
// Récupérer les données dans les 2 tables (il existe une méthode faite pour, cf. doc sequelize)
router.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const task = await Task.findByPk(id, {
      //   include: [
      //     {
      //       model: Type,
      //       where: { id: { [Op.eq]: Sequelize.col("Task.TypeId") } },
      //     },
      //   ],
      attributes: [
        "id",
        "title",
        "done",
        "description",
        "dueDate",
        "createdAt",
        "updatedAt",
        "TypeId",
      ],
    });

    if (!task) {
      res
        .status(404)
        .json({ error: "Cette tâche ou l'un de ses attributs n'existe pas" });
      return;
    }

    res.json(task);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/", async (req, res) => {
  const { title, description, dueDate, TypeId } = req.body;

  try {
    const selectType = await Type.findByPk(TypeId);
    if (!selectType) {
      res.status(404).json({ error: "Ce type de tâche n'existe pas" });
      return;
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      TypeId,
    });

    res.json(task);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const updatedAttributes = req.body;

  try {
    const [updated] = await Task.update(updatedAttributes, {
      where: { id },
    });

    if (updated) {
      const updatedTask = await Task.findByPk(id, {
        attributes: [
          "id",
          "title",
          "done",
          "description",
          "dueDate",
          "createdAt",
          "updatedAt",
          "TypeId",
        ],
      });
      res.json(updatedTask);
    } else {
      res
        .status(404)
        .json({ error: "Cette tâche ou l'un de ses attributs n'existe pas" });
    }
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const task = await Task.findByPk(id);
    if (!task) {
      res
        .status(404)
        .json({ error: "Cette tâche ou l'un de ses attributs n'existe pas" });
      return;
    }

    await task.destroy();
    res.status(204);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
