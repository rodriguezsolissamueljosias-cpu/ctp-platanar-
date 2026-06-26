import React, { useState, useEffect } from 'react';
import { studentAPI } from '../utils/api';

export default function TeacherProfile({ teacher, setSection }) {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [section, setLocalSection] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teacher && teacher.teacherId) {
      setLoading(true);
      studentAPI.getByTeacher(teacher.teacherId)
        .then(res => setStudents(res.data))
        .catch(err => console.error('Error al obtener estudiantes:', err))
        .finally(() => setLoading(false));
    }
  }, [teacher]);

  const addStudent = async () => {
    if (!name || !grade || !section || !parentEmail) {
      alert('Todos los campos son requeridos');
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
      setStudents([...students, res.data]);
      setName(''); 
      setGrade(''); 
      setLocalSection(''); 
      setParentEmail('');
      alert('Estudiante registrado exitosamente');
    } catch (err) {
      alert('Error al registrar estudiante: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  // Eliminar estudiante
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


  return (
    <div className="container">
      <h2>Perfil del Profesor</h2>
      <p><strong>Nombre:</strong> {teacher.name}</p>
      <p><strong>Materia:</strong> {teacher.subject}</p>

      <h3>Seleccionar Sección Activa</h3>
      <select value={section} onChange={(e) => { setLocalSection(e.target.value); setSection(e.target.value); }}>
        <option value="9-1">9-1</option>
        <option value="9-2">9-2</option>
        <option value="10-1">10-1</option>
        <option value="10-2">10-2</option>
      </select>

      <h3>Registrar Estudiante</h3>
      <input placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Grado" value={grade} onChange={e => setGrade(e.target.value)} />
      <input placeholder="Sección" value={section} onChange={e => setLocalSection(e.target.value)} />
      <input placeholder="Correo de Padres" value={parentEmail} onChange={e => setParentEmail(e.target.value)} />
      <button onClick={addStudent} disabled={loading}>Agregar</button>

      <h3>Lista de Estudiantes</h3>
      {loading ? <p>Cargando...</p> : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Grado</th>
              <th>Sección</th>
              <th>Correo Padres</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.grade}</td>
                <td>{s.section}</td>
                <td>{s.parentEmail}</td>
                <td>
                  <button style={{ background: '#f5576c', color: '#fff' }} onClick={() => handleDelete(s.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
