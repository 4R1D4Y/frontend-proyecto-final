import { useAuth } from '../context/AuthContext';
import { useEffect, useRef } from 'react';
import { legalTranslations } from "../lang/legalTranslations";
import { trackEvent } from '../utils/analytics';
import "../styles/legal.css";

/**
 * Componente Legal: Centro de cumplimiento normativo y licencias.
 * 
 * Este componente centraliza toda la documentación legal del proyecto (Licencias, 
 * Términos, Privacidad y Cookies). Utiliza lógica de control para evitar 
 * duplicidad en el registro de métricas de visualización.
 */
const Legal = () => {
  const { lang } = useAuth();
  const t = legalTranslations[lang];

  /**
   * Control de Telemetría:
   * Se utiliza 'useRef' para persistir una bandera booleana a través de 
   * re-renderizados sin disparar nuevos ciclos de vida. Esto asegura que el 
   * evento de analítica 'license_view' solo se registre una vez por sesión 
   * de carga de la página, evitando datos inflados.
   */
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      // Registro del evento en la API de analítica para auditoría de interés legal.
      trackEvent('license_view', null, 1);
      hasTracked.current = true; 
    }
  }, []);
  
  return (
    <div className="legal-container">
      {/* Encabezado con actualización de fecha automática basada en localización */}
      <h1 className="page-title">{t.title}</h1>
      <p className="last-update">{t.update}: {new Date().toLocaleDateString()}</p>

      <div className="legal-content">
        {/* SECCIÓN 1: Gestión de Derechos y Licencias Artísticas */}
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

        {/* SECCIÓN 2: Términos y Condiciones de Uso del Software */}
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

        {/* SECCIÓN 3: Política de Privacidad (Cumplimiento RGPD) */}
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

        {/* SECCIÓN 4: Transparencia Técnica - Política de Cookies */}
        <section className="legal-section">
          <h2 className="legal-subtitle">{t.sec4_title}</h2>
          <div className="legal-card">
            <p>{t.sec4_intro}</p>
            {/* 
                Lista Técnica: Se detallan las cookies de sesión y tokens 
                utilizados para la seguridad y persistencia de la App.
            */}
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