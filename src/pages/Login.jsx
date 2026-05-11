import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { loginTranslations } from '../lang/loginTranslations';
import '../styles/auth.css';

/**
 * Componente Login
 * 
 * Gestiona la autenticación de usuarios. Destaca por su robusto sistema de 
 * manejo de errores, diferenciando entre fallos de credenciales, errores 
 * de validación y estados administrativos de la cuenta (bloqueos/suspensiones).
 */

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState(); // Captura errores para feedback visual
  
  const { login, lang } = useAuth();
  const navigate = useNavigate();
  const t = loginTranslations[lang];

  /**
   * Validación sintáctica de Email.
   * Se realiza en el cliente para evitar llamadas innecesarias a la API
   * y mejorar la velocidad de respuesta de la interfaz.
   */
   const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };

  /**
   * Manejador de Autenticación.
   * Implementa una lógica de captura de excepciones detallada basada en 
   * códigos de estado HTTP estándar.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = [];

    // Validaciones preventivas de campos vacíos o formato erróneo
    if (!email.trim()) {
      newErrors.push('emptyEmail');
    } else if (!validateEmail(email)) {
      newErrors.push('formatEmail');
    }

    if (!password) {
      newErrors.push('emptyPassword');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);

    try {
      // Invocación del servicio de login definido en el Contexto de Autenticación
      await login({ email, password });
      navigate('/'); 
    } catch (err) {
      /**
       * Gestión de Seguridad (Status 403 - Forbidden):
       * Si el servidor devuelve un 403, se procesa si la cuenta está suspendida
       * temporalmente o bloqueada permanentemente, informando al usuario mediante SweetAlert2.
       */
      if (err.response?.status === 403) {
        const { status, until } = err.response.data;
        Swal.fire({
            title: status === 'suspended' ? t.accountSuspended : t.accountBlocked,
            html: `
                <p>${ status === 'suspended' ? t.accountSuspended_message : t.accountBlocked_message}</p>
                ${until ? `<p><strong>${t.accountAvailable}</strong> ${until}</p>` : ''}
                <p style="font-size: 0.8rem; color: #888; margin-top: 15px;">
                    ${t.appeal}
                </p>
            `,
            icon: 'error',
            background: '#181818',
            color: '#fff',
            confirmButtonColor: '#1db954'
        });

      } else if (err.response?.status === 401) {
        // Error de credenciales (Email o contraseña no coinciden en el backend)
        setErrors(['invalidCredentials']);
      } else {
        // Captura de otros errores de servidor o mensajes personalizados
        setErrors([err.response?.data?.message || t.error]);
      }
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2 className="auth-title">{t.title}</h2>
        
        {/* Renderizado de errores: mejora la accesibilidad informando al usuario de fallos específicos */}
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

          <button type="submit" className="auth-submit-btn">
            {t.enter}
          </button>
        </form>

        <p className="auth-footer-text">
          {t.noAccount} {' '}
          <Link to="/register" className="auth-link">
            {t.signup}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;