import React, { useEffect, useState } from 'react';
import apiClient from '../utils/api';

const StudentList = () => {
  const [students, setStudents] = useState([]);

  // Cargar lista de estudiantes al iniciar
  useEffect(() => {
    apiClient.get('/students')
      .then(res => setStudents(res.data))
      .catch(err => console.error(err));
  }, []);

  // Función para marcar asistencia
  const marcarAsistencia = (studentId, estado) => {
    apiClient.put(`/students/${studentId}/attendance`, { status: estado, date: new Date().toISOString() })
      .then(res => {
        alert(res.data.message);
        // Actualizar lista después de marcar (si backend devuelve student actualizado)
        if (res.data.student) {
          setStudents(prev => prev.map(s => s.id === res.data.student.id ? res.data.student : s));
        } else {
          setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: estado } : s));
        }
      })
      .catch(err => {
        console.error(err);
        alert("Error al marcar asistencia");
      });
  };

  // Eliminar estudiante
  const deleteStudent = (studentId) => {
    if (!window.confirm('¿Seguro que desea eliminar este estudiante?')) return;
    apiClient.delete(`/students/${studentId}`)
      .then(() => {
        setStudents(prev => prev.filter(s => s.id !== studentId));
      })
      .catch(err => {
        console.error(err);
        alert('Error al eliminar estudiante');
      });
  };

  return (
    <div>
      <h2>Lista de Estudiantes</h2>
      <table border="1" style={{ width: "100%", textAlign: "center" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Grado</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.grade}</td>
                <td>{student.status}</td>
              <td>
                <button onClick={() => marcarAsistencia(student.id, 'Presente')}>Presente</button>
                  <button onClick={() => marcarAsistencia(student.id, 'Tarde')}>Tarde</button>
                  <button onClick={() => marcarAsistencia(student.id, 'Ausente')}>Ausente</button>
                  <button style={{ marginLeft: 8, background: '#f5576c', color: '#fff' }} onClick={() => deleteStudent(student.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;
