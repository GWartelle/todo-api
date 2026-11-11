const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /:
 *  get:
 *      description: Hello world
 *      tags:
 *       - default
 *      responses:
 *          200:
 *              description: hello world
 */

router.get("/", (req, res) => {
  res.send("Hello world");
});

router.get("/favicon.ico", (req, res) => res.sendStatus(204));

module.exports = router;
