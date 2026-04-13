import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState(null);
  
  const { login } = useAuth(); // Usamos login para auto-loguear tras registrar
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      return setError('Las contraseñas no coinciden');
    }

    try {
      // 1. Llamada al registro en Laravel
      await api.post('/register', {
        name,
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
      <h2>Crear Cuenta</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        {/* <div style={inputGroupStyle}>
          <label>Nombre Completo:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div> */}
        <div style={inputGroupStyle}>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div style={inputGroupStyle}>
          <label>Contraseña:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div style={inputGroupStyle}>
          <label>Confirmar Contraseña:</label>
          <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required />
        </div>
        
        <p style={{ fontSize: '0.8rem' }}>
          Al registrarte, aceptas nuestros <Link to="/legal">Términos y Licencia</Link>.
        </p>

        <button type="submit" style={btnStyle}>Registrarse</button>
      </form>
      <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
    </div>
  );
};

// Estilos rápidos
const formContainerStyle = { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' };
const inputGroupStyle = { marginBottom: '15px', display: 'flex', flexDirection: 'column' };
const btnStyle = { width: '100%', padding: '10px', background: '#1db954', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default Register;