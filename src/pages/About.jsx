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

// --- ESTILOS ---
// const containerStyle = { maxWidth: '900px', margin: '40px auto', padding: '0 20px', color: '#fff' };
// const headerStyle = { textAlign: 'center', marginBottom: '60px' };
// const mainImgStyle = { width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' };
// const sectionStyle = { marginBottom: '40px', textAlign: 'justify' };
// const introTextStyle = { fontSize: '1.25rem', lineHeight: '1.8', color: '#ccc' };
// const infoGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' };
// const cardStyle = { background: '#181818', padding: '25px', borderRadius: '12px', borderLeft: '4px solid #1db954' };
// const featuredSongsStyle = { display: 'flex', gap: '20px', marginTop: '20px', overflowX: 'auto', paddingBottom: '10px' };
// const songItemStyle = { textAlign: 'center', minWidth: '120px' };
// const smallCoverStyle = { width: '120px', height: '120px', borderRadius: '8px', marginBottom: '8px' };
// const communityBoxStyle = { marginTop: '60px', padding: '30px', background: '#1db95422', borderRadius: '15px', border: '1px solid #1db954' };

export default About;