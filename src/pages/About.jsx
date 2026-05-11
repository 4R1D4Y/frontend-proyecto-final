import { useAuth } from '../context/AuthContext';
import { aboutTranslations } from '../lang/aboutTranslations';
import '../styles/about.css';

/**
 * Componente About (Biografía)
 * 
 * Este componente se encarga de presentar la información biográfica del artista.
 * A diferencia de otras secciones dinámicas, utiliza un mapeo de traducciones
 * extenso para ofrecer una narrativa rica y estructurada en varios idiomas.
 */

const About = () => {
  // Consumo del estado global de idioma para la internacionalización de la biografía
  const { lang } = useAuth();
  const t = aboutTranslations[lang];

  return (
    <div className="about-container">
      {/* 
          SECCIÓN HERO: 
          Presentación visual de alto impacto del artista. 
          Utiliza la URL del almacenamiento de Laravel para servir la imagen principal.
      */}
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

      {/* INTRODUCCIÓN: Texto destacado sobre la trayectoria del artista */}
      <section className="about-intro-section">
        <p className="intro-text">{t.intro}</p>
      </section>

      {/* 
          BLOQUES DE INFORMACIÓN (GRID): 
          Organización de la biografía en tarjetas informativas para mejorar 
          la legibilidad y el escaneo de contenido por parte del usuario.
      */}
      <div className="about-grid">
        {/* Artículo: Evolución Musical */}
        <article className="about-card-info">
          <h2 className="section-subtitle">{t.evolution_title}</h2>
          <p>{t.evolution_text}</p>
        </article>

        {/* Artículo: Identidad y conexión con Geometry Dash */}
        <article className="about-card-info">
          <h2 className="section-subtitle">{t.identity_title}</h2>
          <p>{t.identity_text}</p>
          
          {/* 
              Contenedor de Portadas Emblemáticas: 
              Muestra visualmente los hitos más reconocidos de la carrera del artista.
          */}
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

      {/* 
          FOOTER DE SECCIÓN: 
          Información sobre el impacto en la comunidad y creadores de contenido. 
      */}
      <footer className="community-footer-card">
        <h2 className="section-subtitle">{t.community_title}</h2>
        <p>{t.community_text}</p>
      </footer>
    </div>
  );
};

export default About;