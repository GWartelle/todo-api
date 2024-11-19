const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const sequelize = require("../core/orm");

const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING(255),
    validate: {
      isEmail: true,
    },
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  display_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
});

User.beforeCreate(async (user) => {
  console.log("Before hash", user.password);

  const codedPassword = await bcrypt.hash(user.password, 12);
  user.password = codedPassword;

  console.log("After hash", user.password);
});

module.exports = User;
