import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { footerTranslations } from '../lang/footerTranslations';
import { trackEvent } from '../utils/analytics';

const Footer = () => {
  const { lang } = useAuth();
  const t = footerTranslations[lang];
  
  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        
        {/* Sección de Redes Sociales */}
        <div style={socialSectionStyle}>
            <a href="https://x.com/creo_music" target="_blank" rel="noreferrer" style={iconLinkStyle}
              onClick={() => trackEvent('social_redirect', null, 1, { platform: 'X' })}
            >X</a>
            <a href="https://www.youtube.com/@CreoMusic" target="_blank" rel="noreferrer" style={iconLinkStyle}
              onClick={() => trackEvent('social_redirect', null, 1, { platform: 'Youtube' })}
            >Youtube</a>
            <a href="https://open.spotify.com/intl-es/artist/7oh6gwRCYhambO8qcKh3T1" target="_blank" rel="noreferrer" style={iconLinkStyle}
              onClick={() => trackEvent('social_redirect', null, 1, { platform: 'Spotify' })}
            >Spotify</a>
            <a href="https://soundcloud.com/creo" target="_blank" rel="noreferrer" style={iconLinkStyle}
              onClick={() => trackEvent('social_redirect', null, 1, { platform: 'SoundCloud' })}
            >Sound Cloud</a>
            <a href="https://creomusic.newgrounds.com/" target="_blank" rel="noreferrer" style={iconLinkStyle}
              onClick={() => trackEvent('social_redirect', null, 1, { platform: 'Newgrounds' })}
            >Newgrounds</a>
            <a href="https://www.instagram.com/creoig/" target="_blank" rel="noreferrer" style={iconLinkStyle}
              onClick={() => trackEvent('social_redirect', null, 1, { platform: 'Instagram' })}
            >Instagram</a>
            <a href="https://creo.bandcamp.com/" target="_blank" rel="noreferrer" style={iconLinkStyle}
              onClick={() => trackEvent('social_redirect', null, 1, { platform: 'Bandcamp' })}
            >Bandcamp</a>
        </div>

        {/* Sección de Enlaces Legales */}
        <div style={legalSectionStyle}>
          <Link to="/legal" style={legalLinkStyle}>{t.licenses}</Link>
          <Link to="/legal" style={legalLinkStyle}>{t.terms}</Link>
          <Link to="/legal" style={legalLinkStyle}>{t.policy}</Link>
          <Link to="/legal" style={legalLinkStyle}>{t.cookies}</Link>
        </div>

        {/* Copyright */}
        <div style={copyStyle}>
          © {new Date().getFullYear()} Creo Music. {t.reserved}
        </div>
      </div>
        
    </footer>
  );
};

// --- ESTILOS ---
const footerStyle = {
  background: '#1A1D23', // Fondo oscuro
  color: '#b3b3b3',
  padding: '80px 20px 90px 20px',
  marginTop: 'auto', // Empuja el footer al final si usas Flexbox en el layout
  borderTop: '1px solid #282828'
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