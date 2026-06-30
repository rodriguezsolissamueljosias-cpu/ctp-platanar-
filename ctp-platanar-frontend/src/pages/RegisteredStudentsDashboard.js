import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../utils/api';
import './RegisteredStudentsDashboard.css';

export default function RegisteredStudentsDashboard({ teacher }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      if (!teacher) return;
      setLoading(true);
      try {
        const res = await studentAPI.getByTeacher(teacher.teacherId);
        setStudents(res?.data || []);
      } catch (err) {
        console.error(err);
        setMessage('No se pudieron cargar los estudiantes');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [teacher]);

  const handleDelete = async (studentId) => {
    if (!window.confirm('¿Seguro que desea eliminar este estudiante?')) return;
    try {
      await studentAPI.delete(studentId);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      setMessage('✓ Estudiante eliminado');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('✕ Error al eliminar estudiante');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="registered-students-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h2>📋 Estudiantes Registrados</h2>
            <p className="header-subtitle">Listado completo de estudiantes del profesor</p>
          </div>
          <div className="dashboard-actions">
            <button className="btn-primary" onClick={() => navigate('/registrar')}>
              ← Volver al registrador
            </button>
          </div>
        </div>

        {message && <div className="message">{message}</div>}

        <div className="content-section">
          {loading ? (
            <div className="loading">⏳ Cargando estudiantes...</div>
          ) : students.length === 0 ? (
            <div className="empty-state">🎓 No hay estudiantes registrados aún.</div>
          ) : (
            <div className="table-wrapper">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>👤 Nombre</th>
                    <th>📖 Grado</th>
                    <th>🏢 Sección</th>
                    <th>📧 Correo Padres</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={student.id} className={index % 2 === 0 ? 'even' : 'odd'}>
                      <td className="student-name">{student.name}</td>
                      <td>{student.grade}</td>
                      <td><span className="section-badge">{student.section}</span></td>
                      <td className="email">{student.parentEmail || 'N/A'}</td>
                      <td>
                        <button className="btn-danger" onClick={() => handleDelete(student.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
