import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { loginTranslations } from '../lang/loginTranslations';

import '../styles/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  const { login, lang } = useAuth();
  const navigate = useNavigate();
  const t = loginTranslations[lang];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
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
    } else {
        setError(err.response?.data?.message || t.error);
    }
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

          <button type="submit" className="auth-submit-btn">
            {t.enter}
          </button>
        </form>

        <p className="auth-footer-text">
          {lang === 'es' ? '¿No tiene cuenta?' : "Don't have an account?"} {' '}
          <Link to="/register" className="auth-link">
            {lang === 'es' ? 'Regístrate' : 'Sign Up'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;