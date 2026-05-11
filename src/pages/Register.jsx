import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { registerTranslations } from '../lang/registerTranslations';
import "../styles/auth.css";

/**
 * Componente Register
 * 
 * Gestiona el alta de nuevos usuarios en la plataforma. 
 * Implementa validaciones en tiempo de ejecución (lado del cliente) e integra
 * un flujo de registro seguido de autenticación automática (Auto-Login).
 */

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState(); // Estado para capturar y mostrar errores de validación
  
  const { lang, login } = useAuth();
  const t = registerTranslations[lang];
  const navigate = useNavigate();

  /**
   * Validación de sintaxis de correo electrónico.
   * Utiliza una expresión regular (Regex) para asegurar que el input cumple con
   * los estándares de formato antes de realizar la petición al servidor.
   */
  const validateEmail = (email) => {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };

  /**
   * Manejador del envío del formulario.
   * Ejecuta una lógica de validación previa para evitar peticiones innecesarias
   * a la API y gestiona el flujo de registro en el backend.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = [];

    // Validaciones de negocio en el cliente
    if (!email.trim()) {
      newErrors.push('emptyEmail');
    } else if (!validateEmail(email)) {
      newErrors.push('formatEmail');
    }

    if (!password) {
      newErrors.push('emptyPassword');
    } else if (password.length < 8) {
      newErrors.push('shortPassword');
    }

    if (password !== passwordConfirmation) {
      newErrors.push('matchPassword');
    }

    // Si existen errores, se aborta la petición y se informa al usuario
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // 1. Petición asíncrona al endpoint de registro de Laravel (Fortify/Breeze)
      await api.post('/register', {
        email,
        password,
        password_confirmation: passwordConfirmation
      });

      /**
       * 2. Flujo de Auto-Login:
       * Una vez registrado con éxito, se invoca la función 'login' del contexto
       * para autenticar al usuario inmediatamente y mejorar la experiencia de usuario.
       */
      await login({ email, password });
      navigate('/');
    } catch (err) {
      /**
       * Gestión de errores del servidor:
       * Específicamente el error 422 (Unprocessable Entity) que indica que 
       * el email ya se encuentra en uso en la base de datos de Laravel.
       */
      if (err.response?.status === 422) {
        setErrors(['takenEmail']);
      } else {
        setErrors(['error']);
      }
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2 className="auth-title">{t.title}</h2>
        
        {/* Renderizado dinámico de la lista de errores traducidos */}
        {Array.isArray(errors) && errors.length > 0 && (
          <div className="auth-error-msg">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {errors.map((err, index) => (
                <li key={index}>• {t[err]}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Inputs controlados con asociación de etiquetas para accesibilidad */}
          <div className="auth-input-group">
            <label>{t.email}</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="auth-input"
              placeholder="example@mail.com"
            />
          </div>

          <div className="auth-input-group">
            <label>{t.password}</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="auth-input"
              placeholder="••••••••"
            />
          </div>

          <div className="auth-input-group">
            <label>{t.confirm_password}</label>
            <input 
              type="password" 
              value={passwordConfirmation} 
              onChange={(e) => setPasswordConfirmation(e.target.value)} 
              className="auth-input"
              placeholder="••••••••"
            />
          </div>

          {/* Enlace legal para cumplimiento de normativas de privacidad */}
          <p className="auth-terms-text">
            {t.accept_terms} <Link to="/legal" className="auth-link">{t.terms}</Link>
          </p>

          <button type="submit" className="auth-submit-btn">
            {t.register}
          </button>
        </form>

        <p className="auth-footer-text">
          {t.account_exist} {' '}
          <Link to="/login" className="auth-link">
            {t.login}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;