import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { footerTranslations } from '../lang/footerTranslations';
import { trackEvent } from '../utils/analytics';
import "../styles/footer.css";

/**
 * Componente Footer: Pie de página institucional y social.
 * 
 * Gestiona el acceso a redes sociales externas y páginas legales.
 * Incluye lógica de seguimiento de clics para analítica y multidioma dinámico.
 */

const Footer = () => {
  // Obtención del idioma actual del contexto global para traducir enlaces legales y títulos.
  const { lang } = useAuth();
  const t = footerTranslations[lang];
  
  return (
    <footer className="main-footer">
      <div className="footer-container">
        
        <div className="footer-columns">
          {/* 
              COLUMNA SOCIAL: 
              Enlaces a plataformas externas del artista. Se utiliza target="_blank" 
              y rel="noreferrer" por seguridad y rendimiento.
          */}
          <div className="footer-column">
            <h4 className="footer-column-title">{t.social}</h4>
            <div className="footer-links-list">
              {/* 
                  Integración de Analytics: Cada clic dispara 'trackEvent' 
                  enviando metadatos sobre la plataforma elegida. 
              */}
              <a href="https://x.com/creo_music" target="_blank" rel="noreferrer" 
                 onClick={() => trackEvent('social_redirect', null, 1, { platform: 'X' })}>X</a>
              <a href="https://www.youtube.com/@CreoMusic" target="_blank" rel="noreferrer" 
                 onClick={() => trackEvent('social_redirect', null, 1, { platform: 'Youtube' })}>YouTube</a>
              <a href="https://open.spotify.com/intl-es/artist/7oh6gwRCYhambO8qcKh3T1" target="_blank" rel="noreferrer" 
                 onClick={() => trackEvent('social_redirect', null, 1, { platform: 'Spotify' })}>Spotify</a>
              <a href="https://soundcloud.com/creo" target="_blank" rel="noreferrer" 
                 onClick={() => trackEvent('social_redirect', null, 1, { platform: 'SoundCloud' })}>SoundCloud</a>
              <a href="https://creomusic.newgrounds.com/" target="_blank" rel="noreferrer" 
                 onClick={() => trackEvent('social_redirect', null, 1, { platform: 'Newgrounds' })}>Newgrounds</a>
              <a href="https://www.instagram.com/creoig/" target="_blank" rel="noreferrer" 
                 onClick={() => trackEvent('social_redirect', null, 1, { platform: 'Instagram' })}>Instagram</a>
              <a href="https://creo.bandcamp.com/" target="_blank" rel="noreferrer" 
                 onClick={() => trackEvent('social_redirect', null, 1, { platform: 'Bandcamp' })}>Bandcamp</a>
            </div>
          </div>

          {/* 
              COLUMNA LEGAL: 
              Uso de 'Link' de react-router-dom para navegación interna SPA (sin recargar la página).
          */}
          <div className="footer-column">
            <h4 className="footer-column-title">{t.legal}</h4>
            <div className="footer-links-list">
              <Link to="/legal">{t.licenses}</Link>
              <Link to="/legal">{t.terms}</Link>
              <Link to="/legal">{t.policy}</Link>
              <Link to="/legal">{t.cookies}</Link>
            </div>
          </div>
        </div>

        {/* 
            COPYRIGHT: 
            Uso de objeto Date nativo para mantener el año actualizado automáticamente.
        */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Creo Music. {t.reserved}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;