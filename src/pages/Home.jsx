import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homeTranslations } from '../lang/homeTranslations';
import api from '../api/axios';

import '../styles/home.css';

const Home = () => {
  const { user, lang } = useAuth();
  const t = homeTranslations[lang];
  const [latestCovers, setLatestCovers] = useState([]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        // Pedimos las canciones ordenadas por fecha para sacar las portadas
        const res = await api.get('/songs?sort=recent');
        setLatestCovers(res.data.slice(0, 3)); // Solo las 3 primeras
      } catch (err) {
        console.error(err);
      }
    };
    fetchLatest();
  }, []);

  return (
    <div className="home-container">
      <div className="home-content">
        {/* Lado Izquierdo: Textos y Botón */}
        <div className="home-text-section">
          <h1 className="home-title">{t.title}</h1>
          <p className="home-description">{t.description}</p>
          
          <div className="home-actions">
            <Link to="/explore" className="btn-main-white">
              {t.explore}
            </Link>
            {!user && (
              <div className="auth-links">
                <Link to="/login" className="link-secondary">{t.login}</Link>
                <span>|</span>
                <Link to="/register" className="link-secondary">{t.register}</Link>
              </div>
            )}
          </div>
        </div>

        {/* Lado Derecho: Portadas destacadas */}
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