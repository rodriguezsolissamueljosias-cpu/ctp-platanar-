const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Teacher = require('./Teacher');

const Student = sequelize.define('Student', {
  name: { type: DataTypes.STRING, allowNull: false },
  grade: { type: DataTypes.STRING, allowNull: false },
  section: { type: DataTypes.STRING, allowNull: false },
  studentId: { type: DataTypes.STRING, allowNull: false },
  teacherId: { type: DataTypes.INTEGER, allowNull: true }
});

// Relación: un profesor tiene muchos estudiantes
Teacher.hasMany(Student, { foreignKey: 'teacherId' });
Student.belongsTo(Teacher, { foreignKey: 'teacherId' });

module.exports = Student;
