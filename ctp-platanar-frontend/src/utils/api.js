import axios from 'axios';

// URL base de la API desde variables de entorno
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ==================== TEACHERS ====================
export const teacherAPI = {
  register: (teacherData) => apiClient.post('/teachers', teacherData),
  login: (email, password) => apiClient.post('/teachers/login', { email, password }),
  getAll: () => apiClient.get('/teachers'),
  delete: () => apiClient.delete('/teachers')
};

// ==================== STUDENTS ====================
export const studentAPI = {
  create: (studentData) => apiClient.post('/students', studentData),
  getByTeacher: (teacherId) => apiClient.get(`/students/${teacherId}`),
  markAttendance: (studentId, attendanceData) => apiClient.put(`/students/${studentId}/attendance`, attendanceData),
  deleteAll: () => apiClient.delete('/students'),
  delete: (id) => apiClient.delete(`/students/${id}`)
};

// ==================== ATTENDANCE ====================
export const attendanceAPI = {
  getAll: () => apiClient.get('/attendance'),
  create: (attendanceData) => apiClient.post('/attendance', attendanceData),
  update: (id, attendanceData) => apiClient.put(`/attendance/${id}`, attendanceData)
};

// ==================== GRADES ====================
export const gradeAPI = {
  getAll: () => apiClient.get('/grades'),
  create: (data) => apiClient.post('/grades', data),
  delete: (id) => apiClient.delete(`/grades/${id}`)
};

// ==================== SECTIONS ====================
export const sectionAPI = {
  getAll: () => apiClient.get('/sections'),
  create: (data) => apiClient.post('/sections', data),
  delete: (id) => apiClient.delete(`/sections/${id}`)
};

export default apiClient;
