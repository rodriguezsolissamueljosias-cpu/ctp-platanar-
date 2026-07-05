const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Parent = sequelize.define('Parent', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  children: { type: DataTypes.JSON, allowNull: false, defaultValue: [] }
});

module.exports = Parent;
