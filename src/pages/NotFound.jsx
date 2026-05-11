import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notFoundTranslations } from '../lang/notFoundTranslations';
import "../styles/notFound.css";

/**
 * Componente NotFound (Error 404).
 * 
 * Este componente actúa como el manejador de rutas no definidas en React Router.
 * Su objetivo es reorientar al usuario hacia el flujo principal de la aplicación,
 * manteniendo la coherencia visual y el soporte multidioma.
 */
const NotFound = () => {
  // Consumo del idioma global para localizar los mensajes de error.
  const { lang } = useAuth();

  // Mapeo dinámico de contenidos según el estado del sistema.
  const t = notFoundTranslations[lang];

  return (
    <div className="notfound-container">
      {/* Título de error localizado */}
      <h1 className="notfound-title">{t.title}</h1>
      
      {/* 
          Efecto Visual 'Glitch': 
          Implementado mediante CSS especializado para reforzar la identidad 
          digital y electrónica de la plataforma Creo Music. 
      */}
      <div className="glitch-wrapper">
        <span className="error-code">404</span>
      </div>

      {/* Descripción amigable del error para guiar al usuario */}
      <p className="notfound-desc">{t.desc}</p>
      
      {/* 
          Botón de Acción Principal (CTA): 
          Uso de 'Link' para retornar a la página de inicio sin recargar 
          el estado de la aplicación (SPA).
      */}
      <Link to="/" className="btn-notfound">
        {t.button}
      </Link>
    </div>
  );
};


export default NotFound;
