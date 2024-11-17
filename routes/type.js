const express = require("express");
const router = express.Router();
const { Type } = require("../models");
const { Op } = require("sequelize");

router.get("/", async (req, res) => {
  const filterQueries = req.query;

  const typesPerPage = parseInt(filterQueries.typesPerPage, 10) || 5;
  const currentPage = parseInt(filterQueries.page, 10) || 1;

  try {
    const { count: totalTypes, rows: types } = await Type.findAndCountAll({
      attributes: ["id", "title"],
      where: {
        ...(filterQueries.title && {
          title: { [Op.substring]: filterQueries.title },
        }),
      },
      offset: (currentPage - 1) * typesPerPage,
      limit: typesPerPage,
    });

    const hasNextPage = currentPage * typesPerPage < totalTypes;
    const hasPrevPage = currentPage > 1;

    const response = {
      totalTypes,
      currentPage,
      hasNextPage,
      hasPrevPage,
      types,
    };

    res.json(response);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const type = await Type.findByPk(id, {
      attributes: ["id", "title"],
    });

    if (!type) {
      res.status(404).json({
        error: "Ce type de tâche ou l'un de ses attributs n'existe pas",
      });
      return;
    }

    res.json(type);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/", async (req, res) => {
  const { title } = req.body;

  try {
    const type = await Type.create({ title });

    res.json(type);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const updatedAttributes = req.body;

  try {
    const [updated] = await Type.update(updatedAttributes, {
      where: { id },
    });

    if (updated) {
      const updatedType = await Type.findByPk(id, {
        attributes: ["id", "title"],
      });
      res.json(updatedType);
    } else {
      res.status(404).json({
        error: "Ce type de tâche ou l'un de ses attributs n'existe pas",
      });
    }
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const type = await Type.findByPk(id);
    if (!type) {
      res.status(404).json({
        error: "Ce type de tâche ou l'un de ses attributs n'existe pas",
      });
      return;
    }

    await type.destroy();
    res.status(204);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
