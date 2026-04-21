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
  const [error, setError] = useState(null);
  const { lang } = useAuth();
  const t = registerTranslations[lang];
  
  const { login } = useAuth(); // Usamos login para auto-loguear tras registrar
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      return setError(t.error_password_match);
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
      navigate('/explore');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la cuenta');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2 className="auth-title">{t.title}</h2>
        
        {error && <p className="auth-error-msg">{error}</p>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label>{t.email}</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="auth-input"
              placeholder="example@mail.com"
              required 
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
              required 
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
              required 
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

// Estilos rápidos
// const formContainerStyle = { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' };
// const inputGroupStyle = { marginBottom: '15px', display: 'flex', flexDirection: 'column' };
// const btnStyle = { width: '100%', padding: '10px', background: '#1db954', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default Register;