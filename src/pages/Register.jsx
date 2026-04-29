import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { registerTranslations } from '../lang/registerTranslations';

import "../styles/auth.css";

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState();
  const { lang } = useAuth();
  const t = registerTranslations[lang];
  
  const { login } = useAuth(); // Usamos login para auto-loguear tras registrar
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
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
    } else if (password.length < 8) {
      newErrors.push('shortPassword');
    }

    if (password !== passwordConfirmation) {
      newErrors.push('matchPassword');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // 1. Llamada al registro en Laravel
      await api.post('/register', {
        // name,
        email,
        password,
        password_confirmation: passwordConfirmation
      });

      // 2. Si el registro es exitoso, hacemos login automático
      await login({ email, password });
      navigate('/');
    } catch (err) {
      if (err.response?.status === 422) {
        // Laravel devuelve errores de validación aquí
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