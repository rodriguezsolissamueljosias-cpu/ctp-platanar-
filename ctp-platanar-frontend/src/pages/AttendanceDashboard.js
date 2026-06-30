import React, { useState, useEffect } from 'react';
import { studentAPI } from '../utils/api';
import './AttendanceDashboard.css';

export default function AttendanceDashboard({ section, teacher }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [marked, setMarked] = useState({});
  const [notificationMessage, setNotificationMessage] = useState('');
  const teacherId = teacher?.teacherId || 1;

  useEffect(() => {
    if (!section) return;

    setLoading(true);
    studentAPI.getByTeacher(teacherId)
      .then(res => {
        const filtered = res.data.filter(s => s.section === section);
        setStudents(filtered);
        setMarked({});
      })
      .catch(err => console.error('Error al obtener estudiantes:', err))
      .finally(() => setLoading(false));
  }, [section, teacherId]);

  const markAttendance = async (studentId, status) => {
    try {
      const res = await studentAPI.markAttendance(studentId, {
        status,
        teacherId,
        date: new Date().toISOString()
      });
      setMarked(prev => ({ ...prev, [studentId]: status }));

      if (res.data.smtpError) {
        setNotificationMessage(`❌ Asistencia registrada, pero el correo no pudo enviarse: ${res.data.smtpError}`);
      } else if (res.data.smtpConfigured) {
        setNotificationMessage('✅ Asistencia registrada y notificación enviada correctamente.');
      } else if (res.data.previewUrl) {
        setNotificationMessage(`⚠️ Asistencia registrada. No había SMTP configurado. Vista previa: ${res.data.previewUrl}`);
      } else {
        setNotificationMessage('✅ Asistencia registrada. Notificación enviada.');
      }
    } catch (err) {
      alert('Error al registrar asistencia: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('¿Seguro que desea eliminar este estudiante?')) return;
    try {
      await studentAPI.delete(studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));
    } catch (err) {
      console.error(err);
      alert('Error al eliminar estudiante');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Presente': return '#4facfe';
      case 'Tarde': return '#fa709a';
      case 'Ausente': return '#f5576c';
      case 'Justificado': return '#ffa400';
      default: return '#999';
    }
  };

  const presentCount = Object.values(marked).filter(s => s === 'Presente').length;
  const lateCount = Object.values(marked).filter(s => s === 'Tarde').length;
  const absentCount = Object.values(marked).filter(s => s === 'Ausente').length;

  return (
    <div className="attendance-dashboard">
      <div className="container">
        <div className="attendance-header">
          <div>
            <h2>✓ Asistencia</h2>
            <p className="header-subtitle">Sección {section} - {new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>

        <div className="attendance-stats">
          <div className="stat-card stat-present">
            <span className="stat-icon">✓</span>
            <span className="stat-label">Presentes</span>
            <span className="stat-value">{presentCount}</span>
          </div>
          <div className="stat-card stat-late">
            <span className="stat-icon">⏰</span>
            <span className="stat-label">Tardanzas</span>
            <span className="stat-value">{lateCount}</span>
          </div>
          <div className="stat-card stat-absent">
            <span className="stat-icon">✕</span>
            <span className="stat-label">Ausentes</span>
            <span className="stat-value">{absentCount}</span>
          </div>
        </div>
        {notificationMessage && (
          <div className="notification-message">{notificationMessage}</div>
        )}

        {loading ? (
          <div className="loading">
            <p>⏳ Cargando estudiantes...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <p>🎓 No hay estudiantes en esta sección</p>
          </div>
        ) : (
          <div className="attendance-list">
            <div className="attendance-count">
              {students.length} estudiantes por pasar lista
            </div>
            {students.map((s, idx) => (
              <div key={s.id} className="attendance-item">
                <div className="student-info">
                  <span className="student-number">{idx + 1}</span>
                  <span className="student-name">{s.name}</span>
                  <button style={{ marginLeft: 8, background: '#f5576c', color: '#fff' }} onClick={() => handleDelete(s.id)}>Eliminar</button>
                  {marked[s.id] && (
                    <span 
                      className="status-badge" 
                      style={{ background: getStatusColor(marked[s.id]) }}
                    >
                      {marked[s.id]}
                    </span>
                  )}
                </div>
                <div className="attendance-buttons">
                  <button 
                    className="btn-present"
                    onClick={() => markAttendance(s.id, 'Presente')}
                    disabled={marked[s.id] === 'Presente'}
                  >
                    ✓ Presente
                  </button>
                  <button 
                    className="btn-late"
                    onClick={() => markAttendance(s.id, 'Tarde')}
                    disabled={marked[s.id] === 'Tarde'}
                  >
                    ⏰ Tarde
                  </button>
                  <button 
                    className="btn-absent"
                    onClick={() => markAttendance(s.id, 'Ausente')}
                    disabled={marked[s.id] === 'Ausente'}
                  >
                    ✕ Ausente
                  </button>
                  <button 
                    className="btn-justified"
                    onClick={() => markAttendance(s.id, 'Justificado')}
                    disabled={marked[s.id] === 'Justificado'}
                  >
                    📋 Justificado
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
