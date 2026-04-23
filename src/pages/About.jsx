import { useAuth } from '../context/AuthContext';
import { aboutTranslations } from '../lang/aboutTranslations';

import '../styles/about.css';

const About = () => {
  const { lang } = useAuth();
  const t = aboutTranslations[lang];

  return (
    <div className="about-container">
      {/* SECCIÓN HERO: IMAGEN Y NOMBRES */}
      <header className="about-hero">
        <div className="hero-img-wrapper">
          <img 
            src="http://localhost:8000/storage/creo_picture.jpg" 
            alt="Clemens Höberth" 
            className="creo-main-img" 
          />
        </div>
        <h1 className="creo-alias">{t.alias}</h1>
        <p className="creo-real-name">{t.name}</p>
      </header>

      {/* INTRODUCCIÓN */}
      <section className="about-intro-section">
        <p className="intro-text">{t.intro}</p>
      </section>

      {/* BLOQUES DE HISTORIA (GRADIENTE INVERSO) */}
      <div className="about-grid">
        <article className="about-card-info">
          <h2 className="section-subtitle">{t.evolution_title}</h2>
          <p>{t.evolution_text}</p>
        </article>

        <article className="about-card-info">
          <h2 className="section-subtitle">{t.identity_title}</h2>
          <p>{t.identity_text}</p>
          
          <div className="gd-covers-container">
            <div className="gd-cover-wrapper">
              <img src="http://localhost:8000/storage/covers/dimension.jpg" alt="Dimension" />
              <span>Dimension</span>
            </div>
            <div className="gd-cover-wrapper">
              <img src="http://localhost:8000/storage/covers/nautilus.jpg" alt="Nautilus" />
              <span>Nautilus</span>
            </div>
            <div className="gd-cover-wrapper">
              <img src="http://localhost:8000/storage/covers/carnivores.jpg" alt="Carnivores" />
              <span>Carnivores</span>
            </div>
          </div>

          <p className="gd-impact-italic">
            {t.gd_impact}
          </p>
        </article>
      </div>

      {/* COMUNIDAD Y CREADORES */}
      <footer className="community-footer-card">
        <h2 className="section-subtitle">{t.community_title}</h2>
        <p>{t.community_text}</p>
      </footer>
    </div>
  );
};

export default About;