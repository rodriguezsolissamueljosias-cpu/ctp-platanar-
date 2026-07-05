// models/Attendance.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Student = require('./Student');

const Attendance = sequelize.define('Attendance', {
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('Presente', 'Tarde', 'Ausente', 'Escapando', 'Justificado'),
    allowNull: false
  },
  subject: { type: DataTypes.STRING },
  teacherName: { type: DataTypes.STRING }
});

Attendance.belongsTo(Student, { foreignKey: 'studentId' });

module.exports = Attendance;
