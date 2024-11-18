const Type = require("./Type");
const Task = require("./Task");
const User = require("./User");

Task.belongsTo(Type);
Type.hasMany(Task);

// sequelize.sync({ alter: true });

module.exports = {
  Type: Type,
  Task: Task,
  User: User,
};
