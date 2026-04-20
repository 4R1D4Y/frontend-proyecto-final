import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notFoundTranslations } from '../lang/notFoundTranslations';

const NotFound = () => {
  const { lang } = useAuth();

  const t = notFoundTranslations[lang];

  return (
    <div style={containerStyle}>
        <style>
        {`
          @keyframes shake {
            0% { transform: translate(0); }
            25% { transform: translate(-2px, 2px); }
            50% { transform: translate(2px, -2px); }
            75% { transform: translate(-2px, -2px); }
            100% { transform: translate(2px, 2px); }
          }
        `}
        </style>
      <h1 style={titleStyle}>{t.title}</h1>
      <div style={glitchContainer}>
        {/* Un pequeño guiño visual a la estética electrónica */}
        <span style={errorCodeStyle}>404</span>
      </div>
      <p style={descStyle}>{t.desc}</p>
      <Link to="/" style={btnStyle}>
        {t.button}
      </Link>
    </div>
  );
};

// --- ESTILOS ---
const containerStyle = {
  height: '80vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  background: '#121212', // Fondo muy oscuro
  color: '#fff',
  padding: '20px'
};

const titleStyle = {
  fontSize: '1.5rem',
  letterSpacing: '5px',
  color: '#1db954', // El verde neón característico
  marginBottom: '20px'
};

const errorCodeStyle = {
  fontSize: '8rem',
  fontWeight: '900',
  textShadow: '5px 5px #ff0055, -5px -5px #00fbff', // Efecto glitch/anaglifo
  margin: '20px 0'
};

const descStyle = {
  fontSize: '1.1rem',
  color: '#b3b3b3',
  maxWidth: '500px',
  lineHeight: '1.6',
  marginBottom: '40px'
};

const btnStyle = {
  padding: '15px 30px',
  background: '#1db954',
  color: '#fff',
  textDecoration: 'none',
  borderRadius: '30px',
  fontWeight: 'bold',
  transition: 'transform 0.2s'
};

const glitchContainer = {
  position: 'relative',
  animation: 'shake 0.5s infinite alternate'
};

export default NotFound;
