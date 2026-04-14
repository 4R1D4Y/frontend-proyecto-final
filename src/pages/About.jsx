import { useAuth } from '../context/AuthContext';
import { aboutTranslations } from '../lang/aboutTranslations';

const About = () => {
  const { lang } = useAuth();
  const t = aboutTranslations[lang];

  return (
    <div style={containerStyle}>
      {/* CABECERA CON IMAGEN DE CREO */}
      <header style={headerStyle}>
        <img 
          src="http://localhost:8000/storage/creo_picture.jpg" 
          alt="Clemens Höberth" 
          style={mainImgStyle} 
        />
        <h1 style={{fontSize: '3rem', marginBottom: '0'}}>{t.alias}</h1>
        <p style={{color: '#1db954', fontSize: '1.2rem'}}>{t.name}</p>
      </header>

      {/* BIOGRAFÍA PRINCIPAL */}
      <section style={sectionStyle}>
        <p style={introTextStyle}>{t.intro}</p>
      </section>

      {/* EVOLUCIÓN E IDENTIDAD (Dos columnas o bloques) */}
      <div style={infoGridStyle}>
        <section style={cardStyle}>
          <h3>{t.evolution_title}</h3>
          <p>{t.evolution_text}</p>
        </section>
        
        <section style={cardStyle}>
          <h3>{t.identity_title}</h3>
          <p>{t.identity_text}</p>
          <p><em>{t.gd_impact}</em></p>
        </section>
      </div>

      {/* CANCIONES DESTACADAS (Visual) */}
      <section style={{marginTop: '50px'}}>
        <h3 style={{textAlign: 'left'}}>{lang === 'es' ? 'Obras Emblemáticas' : 'Emblematic Works'}</h3>
        <div style={featuredSongsStyle}>
          <div style={songItemStyle}>
             <img src="http://localhost:8000/storage/covers/dimension.jpg" style={smallCoverStyle} />
             <p>Dimension</p>
          </div>
          <div style={songItemStyle}>
             <img src="http://localhost:8000/storage/covers/nautilus.jpg" style={smallCoverStyle} />
             <p>Nautilus</p>
          </div>
          <div style={songItemStyle}>
             <img src="http://localhost:8000/storage/covers/carnivores.jpg" style={smallCoverStyle} />
             <p>Carnivores</p>
          </div>
        </div>
      </section>

      {/* SECCIÓN COMUNIDAD */}
      <footer style={communityBoxStyle}>
        <h4>{t.community_title}</h4>
        <p>{t.community_text}</p>
      </footer>
    </div>
  );
};

// --- ESTILOS ---
const containerStyle = { maxWidth: '900px', margin: '40px auto', padding: '0 20px', color: '#fff' };
const headerStyle = { textAlign: 'center', marginBottom: '60px' };
const mainImgStyle = { width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' };
const sectionStyle = { marginBottom: '40px', textAlign: 'justify' };
const introTextStyle = { fontSize: '1.25rem', lineHeight: '1.8', color: '#ccc' };
const infoGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' };
const cardStyle = { background: '#181818', padding: '25px', borderRadius: '12px', borderLeft: '4px solid #1db954' };
const featuredSongsStyle = { display: 'flex', gap: '20px', marginTop: '20px', overflowX: 'auto', paddingBottom: '10px' };
const songItemStyle = { textAlign: 'center', minWidth: '120px' };
const smallCoverStyle = { width: '120px', height: '120px', borderRadius: '8px', marginBottom: '8px' };
const communityBoxStyle = { marginTop: '60px', padding: '30px', background: '#1db95422', borderRadius: '15px', border: '1px solid #1db954' };

export default About;