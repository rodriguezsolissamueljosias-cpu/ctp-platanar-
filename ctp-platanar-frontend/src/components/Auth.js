import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css'; // 👈 Importa los estilos

const Auth = ({ setToken, setTeacher }) => {
  const [isRegister, setIsRegister] = useState(true);
  const [formData, setFormData] = useState({
    teacherId: '',
    name: '',
    phone: '',
    email: '',
    password: ''
  });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (isRegister) {
        // Registro de profesor
        await apiClient.post('/auth/register', formData);
        alert('Profesor registrado exitosamente');
        setIsRegister(false); // después de registrar, pasa a login
      } else {
        // Inicio de sesión
        const res = await apiClient.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });
        setToken(res.data.token);
        setTeacher(res.data.teacher);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error en la autenticación');
    }
  };

  return (
    <div className="auth-container">
      <h2>{isRegister ? 'Registrar Profesor' : 'Iniciar Sesión'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <>
            <input name="teacherId" placeholder="ID Profesor" onChange={handleChange} />
            <input name="name" placeholder="Nombre completo" onChange={handleChange} />
            <input name="phone" placeholder="Teléfono" onChange={handleChange} />
          </>
        )}
        <input name="email" placeholder="Correo" onChange={handleChange} />
        <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} />
        <button type="submit">{isRegister ? 'Registrar' : 'Entrar'}</button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Ya tengo cuenta' : 'Quiero registrarme'}
      </button>
    </div>
  );
};

export default Auth;
