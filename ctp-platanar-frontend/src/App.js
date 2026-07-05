import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';

import TeacherProfile from './components/TeacherProfile';
import AttendanceDashboard from './pages/AttendanceDashboard';
import JustificationDashboard from './pages/JustificationDashboard';
import StudentsDashboard from './pages/StudentsDashboard';
import RegistrarDashboard from './pages/RegistrarDashboard';
import CreateSectionsDashboard from './pages/CreateSectionsDashboard';
import RegisteredStudentsDashboard from './pages/RegisteredStudentsDashboard';
import ParentPortal from './pages/ParentPortal';
import Settings from './components/Settings';
import Login from './components/Login';
import Register from './components/Register';

function AppContent() {
  const [teacher, setTeacher] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('teacher') || 'null');
    } catch (e) {
      return null;
    }
  });
  const [section, setSection] = useState('9-1');
  const [schoolLogo, setSchoolLogo] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [onboardingMode, setOnboardingMode] = useState('register');
  const location = useLocation();
  const isParentRoute = location.pathname === '/parents' || location.pathname === '/portal-padres' || location.pathname.startsWith('/parents/') || location.pathname.startsWith('/portal-padres/');

  useEffect(() => {
    const saved = localStorage.getItem('schoolLogo');
    if (saved) setSchoolLogo(saved);
  }, []);

  return (
    <div className="app-container">
      {!isParentRoute && (
        <header className="navbar">
          <div className="navbar-top">
            <div className="navbar-left">
              <h1 className="app-title">CTP Platanar</h1>
            </div>
            <div className="navbar-right">
              {schoolLogo && <img src={schoolLogo} alt="Logo Colegio" className="school-logo" />}
              <button 
                className="settings-btn"
                onClick={() => setShowSettings(!showSettings)}
                title="Configuración"
              >
                ⚙️
              </button>
              {teacher && (
                <button
                  className="logout-btn"
                  onClick={() => { localStorage.removeItem('teacher'); setTeacher(null); }}
                  title="Cerrar sesión"
                >
                  Cerrar sesión <span className="logout-icon">🚪</span>
                </button>
              )}
            </div>
          </div>

          <nav className="navbar-bottom">
            <Link to="/" className="nav-link" title="Panel de estudiantes">
              <span role="img" aria-label="Estudiantes">📊</span>
              <span className="nav-link-text">Panel de estudiantes</span>
            </Link>
            <Link to="/sections" className="nav-link">
              🏗️ Crear Secciones
            </Link>
            <Link to="/registrar" className="nav-link">
              📝 Registrador
            </Link>
            <Link to="/attendance" className="nav-link">
              ✓ Asistencia
            </Link>
            <Link to="/justifications" className="nav-link">
              📋 Justificaciones
            </Link>
            <Link to="/parents" className="nav-link">
              👨‍👩‍👧‍👦 Portal Padres
            </Link>
          </nav>
        </header>
      )}

      {!isParentRoute && showSettings && (
        <div className="settings-modal">
          <button className="close-btn" onClick={() => setShowSettings(false)}>✕</button>
          <Settings onLogoUpload={setSchoolLogo} currentLogo={schoolLogo} />
        </div>
      )}

      <main>
        {!isParentRoute && !teacher && (
          <div className="onboarding-overlay">
            <div className="onboarding-card">
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <button onClick={() => setOnboardingMode('register')} className={onboardingMode==='register' ? 'active' : ''}>Registro</button>
                <button onClick={() => setOnboardingMode('login')} className={onboardingMode==='login' ? 'active' : ''}>Iniciar Sesión</button>
              </div>
              {onboardingMode === 'register' ? (
                <Register setTeacher={setTeacher} />
              ) : (
                <Login setTeacher={setTeacher} />
              )}
              <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>Puedes inventar correo y contraseña; esto es solo para identificar tu sesión localmente.</p>
            </div>
          </div>
        )}
        <Routes>
          <Route path="/" element={<StudentsDashboard teacher={teacher} setSection={setSection} section={section} />} />
          <Route path="/sections" element={<CreateSectionsDashboard />} />
          <Route path="/registrar" element={<RegistrarDashboard teacher={teacher} />} />
          <Route path="/registrados" element={<RegisteredStudentsDashboard teacher={teacher} />} />
          <Route path="/attendance" element={<AttendanceDashboard section={section} teacher={teacher} />} />
          <Route path="/justifications" element={<JustificationDashboard section={section} />} />
          <Route path="/parents" element={<ParentPortal />} />
          <Route path="/portal-padres" element={<ParentPortal />} />
          <Route path="/profile" element={<TeacherProfile teacher={teacher} setSection={setSection} />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
