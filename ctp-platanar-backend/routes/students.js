const express = require('express');
const sequelize = require('../db');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Teacher = require('../models/Teacher');

const router = express.Router();

// Registrar estudiante
router.post('/', async (req, res) => {
  try {
    const { name, grade, section, studentId, teacherId } = req.body;
    const resolvedStudentId = (studentId || '').trim() || `STU-${Date.now()}`;
    const student = await Student.create({ name, grade, section, studentId: resolvedStudentId, teacherId });
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: 'Error al registrar estudiante', error: err.message });
  }
});

// Obtener estudiantes por profesor
router.get('/:teacherId', async (req, res) => {
  try {
    const students = await Student.findAll({ where: { teacherId: req.params.teacherId } });

    // Añadir registros de asistencia a cada estudiante
    const studentsWithAttendance = await Promise.all(students.map(async s => {
      const records = await Attendance.findAll({ where: { studentId: s.id }, order: [['date', 'DESC']] });
      return { ...s.toJSON(), attendance: records };
    }));

    res.json(studentsWithAttendance);
  } catch (err) {
    res.status(400).json({ message: 'Error al obtener estudiantes', error: err.message });
  }
});

// Ruta para marcar asistencia de un estudiante (crea un registro de Attendance)
router.put('/:id/attendance', async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'Estudiante no encontrado' });

    const { status, teacherId, date } = req.body;

    // Obtener info del profesor que marca
    const teacher = teacherId ? await Teacher.findOne({ where: { teacherId } }) : null;
    const markedAt = date ? new Date(date) : new Date();

    const attendance = await Attendance.create({
      studentId: student.id,
      status,
      date: markedAt,
      subject: teacher?.subject || null,
      teacherName: teacher?.name || null
    });

    res.json({ message: 'Asistencia registrada', attendance, student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar asistencia', error: err.message });
  }
});

// Borrar todos los estudiantes
router.delete('/', async (req, res) => {
  try {
    await Student.destroy({ where: {} });
    res.json({ message: 'Todos los estudiantes eliminados' });
  } catch (err) {
    res.status(500).json({ message: 'Error al borrar estudiantes', error: err.message });
  }
});

// Borrar un estudiante por id (y sus registros de asistencia)
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    await sequelize.transaction(async (transaction) => {
      await Attendance.destroy({ where: { studentId: id }, transaction });
      const deleted = await Student.destroy({ where: { id }, transaction });
      if (!deleted) {
        throw new Error('NOT_FOUND');
      }
    });

    res.json({ message: 'Estudiante eliminado' });
  } catch (err) {
    if (err.message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }
    console.error('Error borrando estudiante:', err);
    res.status(500).json({ message: 'Error al borrar estudiante', error: err.message });
  }
});

module.exports = router;
