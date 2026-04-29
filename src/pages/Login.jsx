import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { loginTranslations } from '../lang/loginTranslations';

import '../styles/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState();
  
  const { login, lang } = useAuth();
  const navigate = useNavigate();
  const t = loginTranslations[lang];

   const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = [];

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
      await login({ email, password });
      navigate('/'); // Si sale bien, nos manda a la Home
    } catch (err) {
      if (err.response?.status === 403) {
        const { status, until, message } = err.response.data;
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
        // ERROR DE CREDENCIALES (Email o contraseña mal)
        setErrors(['invalidCredentials']);
      } else if (err.response?.data?.errors) {
        // ERRORES DE VALIDACIÓN DEL SERVIDOR (si los hubiera)
        const serverErrors = Object.values(err.response.data.errors).flat();
        setErrors(serverErrors);
        
      } else {
          setErrors([err.response?.data?.message || t.error]);
      }
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2 className="auth-title">{t.title}</h2>
        
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