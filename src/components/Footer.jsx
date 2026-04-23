import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { footerTranslations } from '../lang/footerTranslations';
import { trackEvent } from '../utils/analytics';

import "../styles/footer.css";

const Footer = () => {
  const { lang } = useAuth();
  const t = footerTranslations[lang];
  
  return (
    <footer className="main-footer">
      <div className="footer-container">
        
        <div className="footer-columns">
          {/* COLUMNA SOCIAL */}
          <div className="footer-column">
            <h4 className="footer-column-title">{t.social}</h4>
            <div className="footer-links-list">
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

          {/* COLUMNA LEGAL */}
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

        {/* COPYRIGHT ABAJO */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Creo Music. {t.reserved}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;