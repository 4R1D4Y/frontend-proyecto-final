import { useAuth } from '../context/AuthContext';
import { useEffect, useRef } from 'react';
import { legalTranslations } from "../lang/legalTranslations";
import { trackEvent } from '../utils/analytics';

const Legal = () => {
  const { lang } = useAuth();

  const t = legalTranslations[lang];

  const hasTracked = useRef(false); // 2. Creamos la referencia

  useEffect(() => {
    // 3. Solo disparamos si no se ha hecho ya
    if (!hasTracked.current) {
      trackEvent('license_view', null, 1);
      hasTracked.current = true; // Marcamos como hecho
    }
  }, []);
  
  return (
    <div style={containerStyle}>
      <h1 style={mainTitleStyle}>{t.title}</h1>
      <p style={{ color: '#666', marginBottom: '40px' }}>{t.update}: {new Date().toLocaleDateString()}</p>

      {/* NUEVA SECCIÓN: Licencias de Uso */}
      <section style={sectionStyle}>
        <h2 style={subTitleStyle}>{t.sec1_title}</h2>
        <p>{t.sec1_intro}</p>
        <div style={licenseBoxStyle}>
          <p><strong>{t.sec1_personal_t}</strong> {t.sec1_personal_d}</p>
          <p><strong>{t.sec1_content_t}</strong> {t.sec1_content_d}</p>
          <p><strong>{t.sec1_comercial_t}</strong> {t.sec1_comercial_d}</p>
        </div>
      </section>

      <hr style={dividerStyle} />

      {/* Sección: Términos de Uso */}
      <section style={sectionStyle}>
        <h2 style={subTitleStyle}>{t.sec2_title}</h2>
        <p>{t.sec2_intro}</p>
        <ul style={listStyle}>
          <li>{t.sec2_li1}</li>
          <li>{t.sec2_li2}</li>
          <li>{t.sec2_li3}</li>
        </ul>
      </section>

      <hr style={dividerStyle} />

      {/* Sección: Política de Privacidad */}
      <section style={sectionStyle}>
        <h2 style={subTitleStyle}>{t.sec3_title}</h2>
        <p>{t.sec3_intro}</p>
        <ul style={listStyle}>
          <li><strong>{t.sec3_li1_t}</strong> {t.sec3_li1_d}</li>
          <li><strong>{t.sec3_li2_t}</strong> {t.sec3_li2_d}</li>
        </ul>
      </section>

      {/* Sección: Política de cookies */}
      <section style={sectionStyle}>
        <h2 style={subTitleStyle}>{t.sec4_title}</h2>
        <p>{t.sec4_intro}</p>
        <ul style={listStyle}>
            <li><strong>XSRF-TOKEN:</strong> {t.sec4_li1}</li>
            <li><strong>COOKIE_CONSENT:</strong> {t.sec4_li2}</li>
            <li><strong>AUTH_TOKEN (LocalStorage):</strong> {t.sec4_li3}</li>
            <li><strong>LANGUAGE_PREF:</strong> {t.sec4_li4}</li>
        </ul>
    </section>
    </div>
  );
};

// --- ESTILOS EXTRA ---
const licenseBoxStyle = {
  background: '#f9f9f9',
  borderLeft: '4px solid #1db954',
  padding: '15px',
  marginTop: '10px',
  fontSize: '0.95rem'
};

// ... (Mantén los estilos anteriores de containerStyle, mainTitleStyle, etc.)
const containerStyle = { maxWidth: '800px', margin: '60px auto', padding: '0 20px', lineHeight: '1.6', color: '#333' };
const mainTitleStyle = { fontSize: '2.5rem', marginBottom: '10px' };
const sectionStyle = { marginBottom: '30px' };
const subTitleStyle = { fontSize: '1.5rem', color: '#1db954', marginBottom: '15px' };
const listStyle = { paddingLeft: '20px' };
const dividerStyle = { border: '0', borderTop: '1px solid #eee', margin: '40px 0' };

export default Legal;