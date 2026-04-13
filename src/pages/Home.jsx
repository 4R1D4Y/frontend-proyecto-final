import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Bienvenido a Creo</h1>
      <p style={{ fontSize: '1.2rem', color: '#666' }}>
        Tu plataforma personal para gestionar y disfrutar de tu música.
      </p>
      
      <div style={{ marginTop: '30px' }}>
        {user ? (
          <Link to="/explore" style={btnStyle}>Ir a mi Biblioteca</Link>
        ) : (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link to="/login" style={btnStyle}>Iniciar Sesión</Link>
            <Link to="/register" style={{ ...btnStyle, background: '#eee', color: '#333' }}>Crear Cuenta</Link>
          </div>
        )}
      </div>
    </div>
  );
};

const btnStyle = {
  padding: '12px 24px',
  background: '#1db954',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '25px',
  fontWeight: 'bold'
};

export default Home;