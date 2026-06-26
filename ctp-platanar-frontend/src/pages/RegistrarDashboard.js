import React, { useState, useEffect } from 'react';
import { studentAPI, gradeAPI, sectionAPI } from '../utils/api';
import './RegistrarDashboard.css';

export default function RegistrarDashboard({ teacher }) {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [section, setSection] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sections, setSections] = useState([]);
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      if (!teacher) return;
      setLoading(true);
      try {
        const res = await studentAPI.getByTeacher(teacher.teacherId);
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // cargar grados y secciones
    const loadLists = async () => {
      try {
        const [gRes, sRes] = await Promise.all([gradeAPI.getAll(), sectionAPI.getAll()]);
          setGrades(gRes.data.map(g => ({ id: g.id, name: g.name })));
          setSections(sRes.data.map(s => ({ id: s.id, name: s.name })));
          if (!grade && gRes.data[0]) setGrade(gRes.data[0].name);
          if (!section && sRes.data[0]) setSection(sRes.data[0].name);
      } catch (err) {
        console.error('Error loading grades/sections', err);
      }
    };
    loadLists();
  }, [teacher, grade, section]);

  const addStudent = async () => {
    if (!name || !grade || !section || !parentEmail) {
      setMessage('⚠️ Completa todos los campos');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    try {
      const res = await studentAPI.create({ 
        name, 
        grade, 
        section, 
        parentEmail, 
        teacherId: teacher.teacherId 
      });
      setStudents(prev => [...prev, res.data]);
      setName('');
      setGrade(grades[0] ? grades[0].name : '');
      setSection(sections[0] ? sections[0].name : '');
      setParentEmail('');
      setMessage('✓ Estudiante agregado correctamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('✕ Error al agregar estudiante');
      setTimeout(() => setMessage(''), 3000);
      console.error(err);
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('¿Seguro que desea eliminar este estudiante?')) return;
    try {
      await studentAPI.delete(studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));
      setMessage('✓ Estudiante eliminado');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('✕ Error al eliminar estudiante');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="registrar-dashboard">
      <div className="container">
        <div className="registrar-header">
          <div>
            <h2>📝 Registrador de Estudiantes</h2>
            <p className="header-subtitle">Agrega nuevos estudiantes al sistema</p>
          </div>
        </div>

        <div className="form-section">
          <h3>Agregar Nuevo Estudiante</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">👤 Nombre Completo</label>
              <input 
                id="name"
                type="text" 
                placeholder="Ej: Juan Pérez" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label htmlFor="grade">📖 Grado</label>
              <select 
                id="grade"
                value={grade} 
                onChange={e => setGrade(e.target.value)}
              >
                <option value="">Seleccionar grado</option>
                {grades.map(g => (
                  <option key={g.id} value={g.name}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="section">🏢 Sección</label>
              <select 
                id="section"
                value={section} 
                onChange={e => setSection(e.target.value)}
              >
                {sections.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="email">📧 Correo de Padres</label>
              <input 
                id="email"
                type="email" 
                placeholder="correo@ejemplo.com" 
                value={parentEmail} 
                onChange={e => setParentEmail(e.target.value)} 
              />
            </div>
          </div>

          <button className="btn-add" onClick={addStudent} disabled={loading}>
            ➕ Agregar Estudiante
          </button>

          {message && <div className="message">{message}</div>}
        </div>

        <div className="students-section">
          <h3>📋 Estudiantes Registrados ({students.length})</h3>

          {loading ? (
            <div className="loading">
              <p>⏳ Cargando estudiantes...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <p>🎓 No hay estudiantes registrados aún</p>
            </div>
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
                  {students.map((s, idx) => (
                    <tr key={s.id} className={idx % 2 === 0 ? 'even' : 'odd'}>
                      <td className="student-name">{s.name}</td>
                      <td>{s.grade}</td>
                      <td>
                        <span className="section-badge">{s.section}</span>
                      </td>
                      <td className="email">{s.parentEmail}</td>
                      <td>
                        <button style={{ background: '#f5576c', color: '#fff' }} onClick={() => handleDelete(s.id)}>Eliminar</button>
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
