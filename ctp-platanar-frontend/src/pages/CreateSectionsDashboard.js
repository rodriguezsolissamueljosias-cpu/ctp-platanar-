import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sectionAPI } from '../utils/api';
import './CreateSectionsDashboard.css';

export default function CreateSectionsDashboard() {
  const [sections, setSections] = useState([]);
  const [newSectionName, setNewSectionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadSections = async () => {
    setLoading(true);
    try {
      const res = await sectionAPI.getAll();
      setSections(res.data || []);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las secciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const createSection = async () => {
    const name = newSectionName.trim();
    if (!name) {
      setError('Ingresa un nombre de sección válido');
      return;
    }

    if (sections.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setError('Esa sección ya existe');
      return;
    }

    try {
      await sectionAPI.create({ name });
      setNewSectionName('');
      setError('');
      loadSections();
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Error al crear la sección';
      setError(message);
    }
  };

  const deleteSection = async (sectionId, sectionName) => {
    if (!window.confirm(`Eliminar la sección "${sectionName}"?`)) return;

    try {
      await sectionAPI.delete(sectionId);
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
      setError('');
    } catch (err) {
      console.error(err);
      setError('Error al eliminar la sección');
    }
  };

  return (
    <div className="create-sections-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h2>🏗️ Crear Secciones</h2>
            <p className="header-subtitle">Administra las secciones disponibles para tus estudiantes</p>
          </div>
        </div>

        <div className="dashboard-actions">
          <button className="btn-primary" onClick={() => navigate('/')}>
            ← Volver al Panel
          </button>
        </div>

        <div className="card-section">
          <h3>Agregar nueva sección</h3>
          <div className="section-form">
            <input
              className="section-input"
              placeholder="Nueva sección (ej: 9-1)"
              value={newSectionName}
              onChange={(e) => {
                setNewSectionName(e.target.value);
                setError('');
              }}
            />
            <button className="btn-primary" onClick={createSection}>
              ➕ Crear sección
            </button>
          </div>
          {error && <p className="section-error">{error}</p>}
        </div>

        <div className="card-section">
          <h3>Secciones existentes</h3>
          {loading ? (
            <div className="loading">⏳ Cargando secciones...</div>
          ) : sections.length === 0 ? (
            <div className="empty-state">No hay secciones registradas todavía.</div>
          ) : (
            <ul className="section-list">
              {sections.map((section) => (
                <li key={section.id} className="section-item">
                  <span>{section.name}</span>
                  <button className="btn-danger" onClick={() => deleteSection(section.id, section.name)}>
                    🗑️ Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
