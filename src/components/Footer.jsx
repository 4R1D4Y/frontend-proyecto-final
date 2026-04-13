import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        
        {/* Sección de Redes Sociales */}
        <div style={socialSectionStyle}>
            <a href="https://x.com/creo_music" target="_blank" rel="noreferrer" style={iconLinkStyle}>X</a>
            <a href="https://www.youtube.com/@CreoMusic" target="_blank" rel="noreferrer" style={iconLinkStyle}>Youtube</a>
            <a href="https://open.spotify.com/intl-es/artist/7oh6gwRCYhambO8qcKh3T1" target="_blank" rel="noreferrer" style={iconLinkStyle}>Spotify</a>
            <a href="https://soundcloud.com/creo" target="_blank" rel="noreferrer" style={iconLinkStyle}>Sound Cloud</a>
            <a href="https://creomusic.newgrounds.com/" target="_blank" rel="noreferrer" style={iconLinkStyle}>NewGrounds</a>
            <a href="https://www.instagram.com/creoig/" target="_blank" rel="noreferrer" style={iconLinkStyle}>Instagram</a>
        </div>

        {/* Sección de Enlaces Legales */}
        { <div style={legalSectionStyle}>
          <Link to="/legal" style={legalLinkStyle}>Términos de Uso</Link>
          <Link to="/legal" style={legalLinkStyle}>Política de Privacidad</Link>
          <Link to="/cookies" style={legalLinkStyle}>Cookies</Link>
        </div> }

        {/* Copyright */}
        <div style={copyStyle}>
          © {new Date().getFullYear()} Creo Music. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

// --- ESTILOS ---
const footerStyle = {
  background: '#121212', // Fondo oscuro
  color: '#b3b3b3',
  padding: '40px 20px',
  marginTop: 'auto', // Empuja el footer al final si usas Flexbox en el layout
  borderTop: '1px solid #282828',
};

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '20px'
};

const socialSectionStyle = {
  display: 'flex',
  gap: '20px'
};

const iconLinkStyle = {
  color: '#b3b3b3',
  transition: 'color 0.3s',
  cursor: 'pointer'
};

const legalSectionStyle = {
  display: 'flex',
  gap: '15px',
  fontSize: '0.85rem'
};

const legalLinkStyle = {
  color: '#b3b3b3',
  textDecoration: 'none',
};

const copyStyle = {
  fontSize: '0.75rem',
  marginTop: '10px'
};

export default Footer;