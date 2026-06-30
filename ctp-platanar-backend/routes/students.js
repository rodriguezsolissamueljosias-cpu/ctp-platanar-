const express = require('express');
const sequelize = require('../db');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Teacher = require('../models/Teacher');
const nodemailer = require('nodemailer');

const router = express.Router();

// Registrar estudiante
router.post('/', async (req, res) => {
  try {
    const { name, grade, section, parentEmail, teacherId } = req.body;
    const student = await Student.create({ name, grade, section, parentEmail, teacherId });
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

    // Si está Tarde o Ausente, enviar correo al padre
    if (status === 'Tarde' || status === 'Ausente') {
      if (!student.parentEmail) {
        return res.status(400).json({ message: 'No hay correo de padre registrado para este estudiante.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(student.parentEmail)) {
        return res.status(400).json({ message: 'El correo del padre no es válido.' });
      }

      let transporter;
      let useTestAccount = false;
      let previewUrl = null;
      let smtpError = null;
      const smtpConfigured = Boolean((process.env.SMTP_HOST || process.env.SMTP_SERVICE) && process.env.SMTP_USER && process.env.SMTP_PASS);

      if (smtpConfigured) {
        const smtpSecure = process.env.SMTP_SECURE === 'true';
        const smtpPort = parseInt(process.env.SMTP_PORT, 10) || (smtpSecure ? 465 : 587);
        const transportConfig = {
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          },
          tls: {
            rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false'
          }
        };

        if (process.env.SMTP_SERVICE) {
          transportConfig.service = process.env.SMTP_SERVICE;
          if (process.env.SMTP_HOST) {
            transportConfig.host = process.env.SMTP_HOST;
          }
          if (process.env.SMTP_PORT) {
            transportConfig.port = smtpPort;
          }
          if (process.env.SMTP_SECURE) {
            transportConfig.secure = smtpSecure;
          }
        } else {
          transportConfig.host = process.env.SMTP_HOST;
          transportConfig.port = smtpPort;
          transportConfig.secure = smtpSecure;
        }

        transporter = nodemailer.createTransport(transportConfig);

        try {
          await transporter.verify();
          console.log('SMTP verification passed. Sending email to:', student.parentEmail);
        } catch (verifyErr) {
          console.error('SMTP verification failed:', verifyErr);
          smtpError = `SMTP verification failed: ${verifyErr.message || verifyErr}`;
        }
      }

      if (!smtpConfigured || smtpError) {
        useTestAccount = true;
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
      }

      const formattedDate = new Date(attendance.date).toLocaleString('es-ES');
      const mailOptions = {
        from: process.env.SMTP_FROM || 'CTP Platanar <no-reply@ctp-platanar.edu>',
        to: student.parentEmail,
        subject: `Aviso de asistencia: ${student.name} marcado/a como ${status}`,
        text: `Estimado/a padre o madre,

Le informamos que su hijo/a ${student.name} ha sido marcado/a como *${status}* el día ${formattedDate}.

Materia: ${attendance.subject || 'No registrada'}
Profesor: ${attendance.teacherName || 'No registrado'}

Si tiene alguna duda, por favor contacte a la institución.

Saludos cordiales,
CTP Platanar`,
        html: `<p>Estimado/a padre o madre,</p>
               <p>Le informamos que su hijo/a <strong>${student.name}</strong> ha sido marcado/a como <strong>${status}</strong> el día <strong>${formattedDate}</strong>.</p>
               <ul>
                 <li><strong>Materia:</strong> ${attendance.subject || 'No registrada'}</li>
                 <li><strong>Profesor:</strong> ${attendance.teacherName || 'No registrado'}</li>
                 <li><strong>Acción:</strong> ${status}</li>
               </ul>
               <p>Si tiene alguna duda, por favor contacte a la institución.</p>
               <p>Saludos cordiales,<br />CTP Platanar</p>`
      };

      if (smtpConfigured && !smtpError) {
        try {
          const info = await transporter.sendMail(mailOptions);
          console.log('Correo enviado:', info.messageId);
          if (useTestAccount) {
            previewUrl = nodemailer.getTestMessageUrl(info);
            console.log('URL de prueba:', previewUrl);
          }
        } catch (mailErr) {
          console.error('Error enviando correo:', mailErr);
          smtpError = mailErr.message || String(mailErr);
        }
      } else if (useTestAccount) {
        try {
          const info = await transporter.sendMail(mailOptions);
          console.log('Correo de prueba enviado:', info.messageId);
          previewUrl = nodemailer.getTestMessageUrl(info);
          console.log('URL de prueba:', previewUrl);
        } catch (mailErr) {
          console.error('Error enviando correo de prueba:', mailErr);
          smtpError = mailErr.message || String(mailErr);
        }
      }

      const response = {
        message: 'Asistencia registrada',
        attendance,
        student,
        smtpConfigured: smtpConfigured && !smtpError,
        smtpError
      };
      if (previewUrl) response.previewUrl = previewUrl;

      res.json(response);
      return;
    }

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
