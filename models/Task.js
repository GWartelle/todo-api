const { DataTypes } = require("sequelize");

const sequelize = require("../core/orm");

const Task = sequelize.define("Task", {
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  done: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = Task;
