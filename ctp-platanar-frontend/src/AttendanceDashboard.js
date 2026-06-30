import React, { useEffect, useState } from 'react';
import apiClient from './utils/api';
import './AttendanceDashboard.css';

function AttendanceDashboard({ teacher }) {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (teacher && teacher.teacherId) {
      apiClient.get(`/students/${teacher.teacherId}`)
        .then(res => setStudents(res.data))
        .catch(err => console.error("Error al cargar historial:", err));
    }
  }, [teacher]);

  return (
    <div className="attendance-dashboard">
      <h2>Historial de Asistencia – {teacher.name} ({teacher.subject})</h2>
      {students.map(student => (
        <div key={student.id} className="student-history">
          <h3>{student.name} - Grado: {student.grade} - Sección: {student.section}</h3>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Estado</th>
                <th>Materia</th>
                <th>Profesor</th>
              </tr>
            </thead>
            <tbody>
              {student.attendance.map((a, i) => (
                <tr key={i}>
                  <td>{new Date(a.date).toLocaleDateString()}</td>
                  <td>{new Date(a.date).toLocaleTimeString()}</td>
                  <td>{a.status}</td>
                  <td>{a.subject}</td>
                  <td>{a.teacherName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default AttendanceDashboard;
