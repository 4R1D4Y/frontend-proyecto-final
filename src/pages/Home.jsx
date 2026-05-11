import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homeTranslations } from '../lang/homeTranslations';
import api from '../api/axios';
import '../styles/home.css';

/**
 * Componente Home: Landing page principal del aplicativo.
 * 
 * Este componente gestiona la presentación inicial del proyecto, combinando
 * una interfaz de usuario minimalista con una carga dinámica de activos multimedia
 * (portadas recientes) obtenidos en tiempo real desde la API de Laravel.
 */

const Home = () => {
  const { user, lang } = useAuth();
  const t = homeTranslations[lang];
  
  // Estado local para almacenar las 3 portadas de los lanzamientos más recientes.
  const [latestCovers, setLatestCovers] = useState([]);

  useEffect(() => {
    /**
     * Petición asíncrona para obtener el catálogo musical.
     * Se utiliza el parámetro 'sort=recent' para que el Backend realice
     * el filtrado por fecha de lanzamiento, optimizando la carga de datos.
     */
    const fetchLatest = async () => {
      try {
        const res = await api.get('/songs?sort=recent');
        // Se seleccionan únicamente los 3 primeros registros para el diseño 'stack'.
        setLatestCovers(res.data.slice(0, 3));
      } catch (err) {
        console.error("Error al cargar portadas destacadas:", err);
      }
    };
    fetchLatest();
  }, []);

  return (
    <div className="home-container">
      <div className="home-content">
        
        {/* SECCIÓN DE TEXTO (Llamada a la acción) */}
        <div className="home-text-section">
          <h1 className="home-title">{t.title}</h1>
          <p className="home-description">{t.description}</p>
          
          <div className="home-actions">
            {/* CTA Principal hacia el catálogo musical */}
            <Link to="/explore" className="btn-main-white">
              {t.explore}
            </Link>
            
            {/* Renderizado condicional: Acceso a Auth solo para usuarios no autenticados */}
            {!user && (
              <div className="auth-links">
                <Link to="/login" className="link-secondary">{t.login}</Link>
                <span>|</span>
                <Link to="/register" className="link-secondary">{t.register}</Link>
              </div>
            )}
          </div>
        </div>

        {/* 
            SECCIÓN VISUAL: Grid de Portadas.
            Las clases 'img-${index}' permiten aplicar transformaciones CSS únicas 
            (rotaciones y desplazamientos) para lograr un efecto visual de abanico 
            o stack profesional.
        */}
        <div className="home-covers-grid">
          {latestCovers.map((song, index) => (
            <img 
              key={song.id} 
              src={song.cover_path} 
              className={`home-cover-img img-${index}`} 
              alt={song.name} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;