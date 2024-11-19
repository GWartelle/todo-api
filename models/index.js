// const sequelize = require("../core/orm");
const Task = require("./Task");
const Type = require("./Type");
const User = require("./User");

Task.belongsTo(Type);
Task.belongsTo(User);
Type.hasMany(Task);
User.hasMany(Task);

sequelize.sync({ alter: true });

module.exports = {
  Type,
  Task,
  User,
};
