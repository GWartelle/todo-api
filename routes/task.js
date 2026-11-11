const express = require("express");
const router = express.Router();
const { Type, Task, User } = require("../models");
const { Op } = require("sequelize");

/**
 * @swagger
 * /:
 *   get:
 *     summary: Retrieve a list of tasks with optional filtering, pagination, and user-specific constraints.
 *     description: >
 *       Fetches a list of tasks for the authenticated user. Supports filters for task title, completion status (`isDone`),
 *       and lateness (`isLate`). Pagination parameters are also supported to limit the number of results per page.
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: query
 *         name: tasksPerPage
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of tasks to return per page.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve.
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter tasks containing the specified title substring.
 *       - in: query
 *         name: isDone
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter tasks based on their completion status (`true` for done, `false` for not done).
 *       - in: query
 *         name: isLate
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: >
 *           Filter tasks based on lateness. If `true`, returns tasks with due dates in the past and not completed.
 *           If `false`, returns tasks that are either completed or have due dates in the future.
 *     responses:
 *       200:
 *         description: A paginated list of tasks.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTasks:
 *                   type: integer
 *                   description: Total number of tasks matching the filters.
 *                 currentPage:
 *                   type: integer
 *                   description: The current page of results.
 *                 hasNextPage:
 *                   type: boolean
 *                   description: Indicates if there are more pages of results.
 *                 hasPrevPage:
 *                   type: boolean
 *                   description: Indicates if there are previous pages of results.
 *                 tasks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       done:
 *                         type: boolean
 *                       description:
 *                         type: string
 *                       dueDate:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       TypeId:
 *                         type: integer
 *                       UserId:
 *                         type: integer
 *                       Type:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *       400:
 *         description: Invalid filter value provided (e.g., invalid `isDone` or `isLate` value).
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erreur serveur
 */

router.get("/", async (req, res) => {
  const UserId = req.userId;
  const filterQueries = req.query;
  const validBooleanValues = ["true", "false"];

  const tasksPerPage = parseInt(filterQueries.tasksPerPage, 10) || 5;
  const currentPage = parseInt(filterQueries.page, 10) || 1;

  if (
    filterQueries.isDone &&
    !validBooleanValues.includes(filterQueries.isDone)
  ) {
    return res
      .status(400)
      .send(
        "Valeur invalide pour le filtre 'isDone'. Seules les valeurs 'true' ou 'false' sont autorisées"
      );
  }

  if (
    filterQueries.isLate &&
    !validBooleanValues.includes(filterQueries.isLate)
  ) {
    return res
      .status(400)
      .send(
        "Valeur invalide pour le filtre 'isLate'. Seules les valeurs 'true' ou 'false' sont autorisées"
      );
  }

  const whereClause = {
    ...(filterQueries.title && {
      title: { [Op.substring]: filterQueries.title },
    }),
    ...(filterQueries.isDone && { done: filterQueries.isDone === "true" }),
    ...(filterQueries.isLate && {
      [Op.and]: [
        { done: false },
        {
          dueDate:
            filterQueries.isLate === "true"
              ? { [Op.lt]: new Date() }
              : { [Op.gte]: new Date() },
        },
      ],
    }),
  };

  try {
    const { count: totalTasks, rows: tasks } = await Task.findAndCountAll({
      attributes: [
        "id",
        "title",
        "done",
        "description",
        "dueDate",
        "createdAt",
        "updatedAt",
        "TypeId",
        "UserId",
      ],
      where: {
        [Op.and]: [
          Object.keys(whereClause).length ? whereClause : {},
          {
            UserId: { [Op.eq]: UserId },
          },
        ],
      },
      offset: (currentPage - 1) * tasksPerPage,
      limit: tasksPerPage,
      include: [
        {
          model: Type,
          attributes: ["id", "title"],
        },
      ],
    });

    const hasNextPage = currentPage * tasksPerPage < totalTasks;
    const hasPrevPage = currentPage > 1;

    const response = {
      totalTasks,
      currentPage,
      hasNextPage,
      hasPrevPage,
      tasks,
    };

    res.json(response);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (isNaN(id)) {
    return res.status(400).json({ error: "Format d'ID invalide" });
  }

  try {
    const task = await Task.findOne({
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
      where: {
        id: id,
      },
      include: [
        {
          model: Type,
          attributes: ["id", "title"],
        },
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
  const UserId = req.userId;

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
      UserId,
    });

    res.json(task);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  if (isNaN(id)) {
    return res.status(400).json({ error: "Format d'ID invalide" });
  }

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
  if (isNaN(id)) {
    return res.status(400).json({ error: "Format d'ID invalide" });
  }

  try {
    const task = await Task.findByPk(id);
    if (!task) {
      res
        .status(404)
        .json({ error: "Cette tâche ou l'un de ses attributs n'existe pas" });
      return;
    }

    await task.destroy();
    res.status(204).send();
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
