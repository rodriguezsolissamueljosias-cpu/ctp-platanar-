import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI, gradeAPI, sectionAPI } from '../utils/api';
import './RegistrarDashboard.css';

export default function RegistrarDashboard({ teacher }) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [section, setSection] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sections, setSections] = useState([]);
  const [grades, setGrades] = useState([
    { id: 'grade-a', name: 'A' },
    { id: 'grade-b', name: 'B' }
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadLists = async () => {
      try {
        const [gRes, sRes] = await Promise.all([gradeAPI.getAll(), sectionAPI.getAll()]);
        const loadedGrades = (gRes?.data || []).map(g => ({ id: g.id, name: g.name }));
        const loadedSections = (sRes?.data || []).map(s => ({ id: s.id, name: s.name }));

        setGrades(loadedGrades.length > 0 ? loadedGrades : [
          { id: 'grade-a', name: 'A' },
          { id: 'grade-b', name: 'B' }
        ]);
        setSections(loadedSections);

        setGrade(current => current || (loadedGrades[0] ? loadedGrades[0].name : 'A'));
        setSection(current => current || (loadedSections[0] ? loadedSections[0].name : ''));
      } catch (err) {
        console.error('Error loading grades/sections', err);
      }
    };
    loadLists();
  }, []);

  const addStudent = async () => {
    if (!name || !grade || !section || !parentEmail) {
      setMessage('⚠️ Completa todos los campos');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    try {
      await studentAPI.create({ 
        name, 
        grade, 
        section, 
        parentEmail, 
        teacherId: teacher.teacherId 
      });
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

  return (
    <div className="registrar-dashboard">
      <div className="container">
        <div className="registrar-header">
          <div>
            <h2>📝 Registrador de Estudiantes</h2>
            <p className="header-subtitle">Agrega nuevos estudiantes al sistema</p>
          </div>
          <div className="registrar-actions">
            <button className="btn-secondary" onClick={() => navigate('/registrados')}>
              📋 Estudiantes Registrados
            </button>
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

      </div>
    </div>
  );
}
