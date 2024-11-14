const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("Hello world");
});

router.get("/favicon.ico", (req, res) => res.sendStatus(204));

module.exports = router;
