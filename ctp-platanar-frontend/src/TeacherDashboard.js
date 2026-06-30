import React, { useState, useEffect } from 'react';
import apiClient from './utils/api';
import './TeacherDashboard.css';

function TeacherDashboard({ teacher }) {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (teacher && teacher.teacherId) {
      apiClient.get(`/students/${teacher.teacherId}`)
        .then(res => setStudents(res.data))
        .catch(err => console.error("Error al cargar estudiantes:", err));
    }
  }, [teacher]);

  const markAttendance = (studentId, status) => {
      apiClient.put(`/students/${studentId}/attendance`, {
      status,
      teacherId: teacher.teacherId,
      date: new Date().toISOString()
    })
      .then(res => {
        setStudents(students.map(s => s.id === studentId ? (res.data.student || s) : s));
      })
      .catch(err => alert("Error al marcar asistencia"));
  };

  const handleDelete = (studentId) => {
    if (!window.confirm('¿Seguro que desea eliminar este estudiante?')) return;
    apiClient.delete(`/students/${studentId}`)
      .then(() => setStudents(prev => prev.filter(s => s.id !== studentId)))
      .catch(err => alert('Error al eliminar estudiante'));
  };

  return (
    <div className="dashboard-container">
      <h2>Bienvenido, {teacher.name} – {teacher.subject}</h2>

      <h3>Lista de Estudiantes</h3>
      <ul className="student-list">
        {students.map((student) => (
          <li key={student.id} className="student-item">
              {student.name} - Grado: {student.grade} - Sección: {student.section}
              <button style={{ marginLeft: 8, background: '#f5576c', color: '#fff' }} onClick={() => handleDelete(student.id)}>Eliminar</button>
              <div className="attendance-buttons">
                <button onClick={() => markAttendance(student.id, 'Presente')}>Presente</button>
                <button onClick={() => markAttendance(student.id, 'Tarde')}>Tarde</button>
                <button onClick={() => markAttendance(student.id, 'Ausente')}>Ausente</button>
              </div>
            <div className="attendance-history">
              <h4>Historial:</h4>
              <ul>
                {student.attendance.map((a, i) => (
                  <li key={i}>
                    {new Date(a.date).toLocaleString()} - {a.status} ({a.subject}, {a.teacherName})
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TeacherDashboard;
