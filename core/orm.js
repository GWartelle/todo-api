const Sequelize = require("sequelize");

const sequelizeInstance = new Sequelize(
  process.env.DB_NAME_BIS,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  { host: "localhost", dialect: "mysql" }
);

module.exports = sequelizeInstance;
