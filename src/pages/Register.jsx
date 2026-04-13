import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { registerTranslations } from '../lang/registerTranslations';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState(null);
  const lang = localStorage.getItem('LANGUAGE_PREF') || 'es';
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
    <div style={formContainerStyle}>
      <h2>{t.title}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        {/* <div style={inputGroupStyle}>
          <label>Nombre Completo:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div> */}
        <div style={inputGroupStyle}>
          <label>{t.email}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div style={inputGroupStyle}>
          <label>{t.password}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div style={inputGroupStyle}>
          <label>{t.confirm_password}</label>
          <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required />
        </div>
        
        <p style={{ fontSize: '0.8rem' }}>
          {t.accept_terms} <Link to="/legal">{t.terms}</Link>.
        </p>

        <button type="submit" style={btnStyle}>{t.register}</button>
      </form>
      <p>{t.account_exist} <Link to="/login">{t.login}</Link></p>
    </div>
  );
};

// Estilos rápidos
const formContainerStyle = { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' };
const inputGroupStyle = { marginBottom: '15px', display: 'flex', flexDirection: 'column' };
const btnStyle = { width: '100%', padding: '10px', background: '#1db954', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default Register;