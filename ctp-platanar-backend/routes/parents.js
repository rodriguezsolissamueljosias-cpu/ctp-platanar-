const express = require('express');
const Parent = require('../models/Parent');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const { parseChildren } = require('../utils/parentPortal');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, children } = req.body;
    const parsedChildren = parseChildren(children);

    if (!firstName || !lastName || parsedChildren.length === 0) {
      return res.status(400).json({ message: 'Faltan datos para registrar al padre' });
    }

    const parent = await Parent.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      children: parsedChildren
    });

    res.status(201).json({
      id: parent.id,
      firstName: parent.firstName,
      lastName: parent.lastName,
      children: parent.children || []
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error al registrar acceso de padres', error: err.message });
  }
});

router.get('/:parentId', async (req, res) => {
  try {
    const parent = await Parent.findByPk(req.params.parentId);
    if (!parent) {
      return res.status(404).json({ message: 'Portal no encontrado' });
    }

    const children = parent.children || [];
    const childrenWithData = await Promise.all(children.map(async (child) => {
      const student = await Student.findOne({ where: { studentId: child.studentId } });
      const attendance = student
        ? await Attendance.findAll({ where: { studentId: student.id }, order: [['date', 'DESC']] })
        : [];

      return {
        ...child,
        studentId: child.studentId,
        studentName: student?.name || child.name,
        attendance
      };
    }));

    res.json({
      id: parent.id,
      firstName: parent.firstName,
      lastName: parent.lastName,
      children: childrenWithData
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error al cargar el portal de padres', error: err.message });
  }
});

module.exports = router;
