import React, { useState } from 'react';
import { teacherAPI } from './utils/api';

function RegisterTeacher({ onRegister, onSwitch }) {
  const [teacherId, setTeacherId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await teacherAPI.register({
        teacherId,
        name,
        phone,
        email,
        password,
        subject
      });
      onRegister(res.data); // pasa el profesor al App.js
    } catch (err) {
      alert("Error al registrar profesor");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Registrar Profesor</h2>
      <input type="text" placeholder="ID del Profesor" value={teacherId} onChange={e => setTeacherId(e.target.value)} required />
      <input type="text" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} required />
      <input type="text" placeholder="Teléfono" value={phone} onChange={e => setPhone(e.target.value)} required />
      <input type="email" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
      <input type="text" placeholder="Materia" value={subject} onChange={e => setSubject(e.target.value)} required />
      <button type="submit">Registrar</button>
      <p>¿Ya tienes cuenta? <button type="button" onClick={onSwitch}>Inicia sesión aquí</button></p>
    </form>
  );
}

export default RegisterTeacher;
