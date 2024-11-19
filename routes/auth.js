const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password, display_name } = req.body;

  if (!password || !email || !display_name) {
    res.status(400);
    res.json({
      error: "Fields 'email', 'password' and 'display name'  are mandatory",
    });
    return;
  }

  if (password.length < 8) {
    res.status(400);
    res.json({ error: "Password must be at least 8 characters long" });
    return;
  }

  const user = await User.build({
    email,
    password,
    display_name,
  });

  try {
    await user.validate({ fields: ["email"] });
  } catch (error) {
    res.status(400);
    res.json({ error: "The email is not valid or is already taken" });
    return;
  }

  try {
    await user.save();
    res.status(204);
    res.send("Ok");
  } catch (error) {
    res.status(500);
    console.error(error);
    res.json({ error: "Unknown error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    res.json({
      error: "Fields 'email' and 'password' are mandatory",
    });
    return;
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(400);
      res.json({ error: `Email or password incorrect` });
      return;
    }

    const passwordOk = await bcrypt.compare(password, user.password);

    if (!passwordOk) {
      res.status(400);
      res.json({
        error: "Email or password incorrect",
      });
      return;
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_PRIVATE_KEY, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500);
    console.error(error);
    res.json({ error: "Unknown error" });
  }
});

router.post("/verify-token", async (req, res) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    res.status(401);
    res.send("Unauthorized");
    return;
  }

  const token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_PRIVATE_KEY, (error, payload) => {
    if (error) {
      res.status(401);
      if (error.name == "TokenExpiredError") {
        res.send("Token expired");
      } else {
        res.send("Invalid token");
      }
      return;
    }

    res.send("Welcome user n°" + payload.id);
  });
});

module.exports = router;
