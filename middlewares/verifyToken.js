const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
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
    }

    req.user = payload;
    next();
  });
};

module.exports = verifyToken;
