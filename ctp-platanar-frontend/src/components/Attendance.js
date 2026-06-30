import React, { useState, useEffect } from 'react';
import apiClient from '../utils/api';

function Attendance({ students }) {
  const [records, setRecords] = useState([]);

  // Cargar historial completo
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/attendance');
        setRecords(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Agrupar registros por estudiante y fecha
  const grouped = {};
  records.forEach(r => {
    if (!grouped[r.studentId]) grouped[r.studentId] = {};
    grouped[r.studentId][r.date] = r;
  });

  // Obtener todas las fechas únicas
  const allDates = [...new Set(records.map(r => r.date))].sort();

  const updateStatus = async (recordId, newStatus) => {
    try {
      const res = await apiClient.put(`/attendance/${recordId}`, {
        status: newStatus
      });
      setRecords(records.map(r => r.id === recordId ? res.data : r));
    } catch (err) {
      alert('Error al actualizar asistencia');
    }
  };

  return (
    <div>
      <h3>Historial de Asistencia</h3>
      <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Estudiante</th>
            {allDates.map(date => (
              <th key={date}>{date}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              {allDates.map(date => {
                const record = grouped[s.id]?.[date];
                return (
                  <td key={date}>
                    {record ? (
                      <select
                        value={record.status}
                        onChange={(e) => updateStatus(record.id, e.target.value)}
                      >
                        <option value="Presente">Presente</option>
                        <option value="Tarde">Tarde</option>
                        <option value="Ausente">Ausente</option>
                        <option value="Justificado">Justificado</option>
                      </select>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Attendance;
