import { useAuth } from '../context/AuthContext';
import { useEffect, useRef } from 'react';
import { legalTranslations } from "../lang/legalTranslations";
import { trackEvent } from '../utils/analytics';

import "../styles/legal.css";

const Legal = () => {
  const { lang } = useAuth();

  const t = legalTranslations[lang];

  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      trackEvent('license_view', null, 1);
      hasTracked.current = true; // Marcamos como hecho
    }
  }, []);
  
  return (
    <div className="legal-container">
      <h1 className="page-title">{t.title}</h1>
      <p className="last-update">{t.update}: {new Date().toLocaleDateString()}</p>

      <div className="legal-content">
        {/* SECCIÓN 1: Licencias de Uso */}
        <section className="legal-section">
          <h2 className="legal-subtitle">{t.sec1_title}</h2>
          <div className="legal-card">
            <p className="legal-intro">{t.sec1_intro}</p>
            <ul className="legal-list">
              <li><strong>{t.sec1_personal_t}</strong> {t.sec1_personal_d}</li>
              <li><strong>{t.sec1_content_t}</strong> {t.sec1_content_d}</li>
              <li><strong>{t.sec1_comercial_t}</strong> {t.sec1_comercial_d}</li>
            </ul>
          </div>
        </section>

        {/* SECCIÓN 2: Términos de Uso */}
        <section className="legal-section">
          <h2 className="legal-subtitle">{t.sec2_title}</h2>
          <div className="legal-card">
            <p>{t.sec2_intro}</p>
            <ul className="legal-list dots">
              <li>{t.sec2_li1}</li>
              <li>{t.sec2_li2}</li>
              <li>{t.sec2_li3}</li>
            </ul>
          </div>
        </section>

        {/* SECCIÓN 3: Política de Privacidad */}
        <section className="legal-section">
          <h2 className="legal-subtitle">{t.sec3_title}</h2>
          <div className="legal-card">
            <p>{t.sec3_intro}</p>
            <ul className="legal-list">
              <li><strong>{t.sec3_li1_t}</strong> {t.sec3_li1_d}</li>
              <li><strong>{t.sec3_li2_t}</strong> {t.sec3_li2_d}</li>
            </ul>
          </div>
        </section>

        {/* SECCIÓN 4: Política de Cookies */}
        <section className="legal-section">
          <h2 className="legal-subtitle">{t.sec4_title}</h2>
          <div className="legal-card">
            <p>{t.sec4_intro}</p>
            <ul className="legal-list tech">
                <li><span>XSRF-TOKEN:</span> {t.sec4_li1}</li>
                <li><span>COOKIE_CONSENT:</span> {t.sec4_li2}</li>
                <li><span>AUTH_TOKEN (Local):</span> {t.sec4_li3}</li>
                <li><span>LANGUAGE_PREF:</span> {t.sec4_li4}</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Legal;