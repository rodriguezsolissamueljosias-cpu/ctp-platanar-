import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI, sectionAPI } from '../utils/api';
import './StudentsDashboard.css';

export default function StudentsDashboard({ teacher, setSection, section }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sections, setSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const navigate = useNavigate();

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetch = async () => {
      if (!teacher) return;
      setLoading(true);
      try {
        const res = await studentAPI.getByTeacher(teacher.teacherId);
        setStudents(res.data.filter(s => !section || s.section === section));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [teacher, section]);

  useEffect(() => {
    const fetchSections = async () => {
      setSectionsLoading(true);
      try {
        const res = await sectionAPI.getAll();
        setSections(res.data || []);
        // if current section not set or missing, pick first
        if ((!section || !res.data.find(s => s.name === section)) && res.data && res.data.length > 0) {
          setSection(res.data[0].name);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSectionsLoading(false);
      }
    };
    fetchSections();
  }, [setSection, section]);

  const handleDelete = async (studentId) => {
    try {
      await studentAPI.delete(studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));
    } catch (err) {
      console.error(err);
      alert('Error al eliminar estudiante');
    }
  };


  return (
    <div className="students-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h2>📚 Panel de Estudiantes</h2>
            <p className="header-subtitle">Profesor: {teacher ? `${teacher.name} | ${teacher.subject}` : 'No identificado - por favor inicia sesión'}</p>
          </div>
        </div>

        <div className="section-selector">
          <label>Selecciona Sección:</label>
          <select value={section} onChange={(e) => setSection(e.target.value)} className="section-select">
            {sectionsLoading ? (
              <option>Loading...</option>
            ) : (
              sections.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))
            )}
          </select>
          <div className="search-field">
            <label htmlFor="student-search">Buscar estudiante:</label>
            <input
              id="student-search"
              className="search-input"
              type="text"
              placeholder="Deiby Samir"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="action-buttons">
          <button 
            className="btn-primary"
            onClick={() => navigate('/registrar')}
          >
            📝 Registrador de Estudiantes
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/sections')}
          >
            🏗️ Crear Secciones
          </button>
          <button 
            className="btn-success"
            onClick={() => navigate('/attendance')}
          >
            ✓ Pasar Asistencia
          </button>
          <button 
            className="btn-success"
            onClick={() => navigate('/justifications')}
          >
            📋 Justificaciones
          </button>
        </div>

        <div className="students-info">
          <h3>📊 Total de Estudiantes: <span className="count">{students.length}</span></h3>
          {searchTerm && (
            <p className="search-info">Filtrando por: "{searchTerm}"</p>
          )}
        </div>

        {loading ? (
          <div className="loading">
            <p>⏳ Cargando estudiantes...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <p>🎓 No hay estudiantes registrados en esta sección</p>
            <button className="btn-primary" onClick={() => navigate('/registrar')}>
              Agregar Primer Estudiante
            </button>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-state">
            <p>🔎 No se encontraron estudiantes con ese nombre.</p>
            <button className="btn-primary" onClick={() => setSearchTerm('')}>
              Mostrar todos
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>👤 Nombre</th>
                  <th>📖 Grado</th>
                  <th>🏢 Sección</th>
                  <th>🆔 ID</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, idx) => (
                  <tr key={s.id} className={idx % 2 === 0 ? 'even' : 'odd'}>
                    <td className="student-name">{s.name}</td>
                    <td>{s.grade}</td>
                    <td>
                      <span className="section-badge">{s.section}</span>
                    </td>
                    <td className="email">{s.studentId || 'N/A'}</td>
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
  );
}
