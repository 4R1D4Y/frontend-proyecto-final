import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { ThumbsUp, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { exploreTranslations } from '../lang/exploreTranslations';
import { trackEvent } from '../utils/analytics';

import '../styles/explore.css';

const Explore = () => {
  const { user, lang } = useAuth();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const [sort, setSort] = useState('oldest');
  const audioRef = useRef(null);
  const [lastTrackedTime, setLastTrackedTime] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const t = exploreTranslations[lang];

  // URL base para las imágenes (definida en tu .env de React)
  // const storageUrl = import.meta.env.VITE_STORAGE_URL;

  const handlePlay = () => {
    // Si es la primera vez que suena esta canción desde que se seleccionó
    if (!hasStarted) {
        // Enviamos un valor especial o un evento diferente para contar la reproducción
        trackEvent('playtime', currentSong.id, 0, { action: 'new_play' });
        setHasStarted(true);
    }
    setLastTrackedTime(audioRef.current.currentTime);
  };

  const handlePauseOrEnd = () => {
    if (!audioRef.current) return;

    // Calculamos la diferencia entre el segundo actual y cuando empezó a sonar
    const currentTime = audioRef.current.currentTime;
    const elapsed = Math.round(currentTime - lastTrackedTime);

    // Solo enviamos al servidor si escuchó al menos 2 segundos (para evitar ruidos)
    if (elapsed >= 2) {
      trackEvent('playtime', currentSong.id, elapsed);
      // Actualizamos la marca de tiempo por si vuelve a darle al play sin cambiar de canción
      setLastTrackedTime(currentTime);
    }
  };

  const handleInteraction = async (songId, type) => {
    if (!user) return alert(t.interactions);

    try {
      // type será 'like' o 'favorite' según el botón pulsado
      const res = await api.post(`/songs/${songId}/${type}`);
      
      // Actualizamos el estado local de la lista de canciones
      setSongs(songs.map(song => {
        if (song.id === songId) {
          return { 
            ...song, 
            // Si el backend devuelve 'is_liked' o 'is_favorite', lo actualizamos
            is_liked: type === 'like' ? res.data.is_liked : song.is_liked,
            is_favorite: type === 'favorite' ? res.data.is_favorite : song.is_favorite
          };
        }
        return song;
      }));
    } catch (error) {
      console.error(`Error en ${type}:`, error);
    }
  };

  const playNextSong = () => {
    if (!currentSong) return;

    // 1. Buscamos el índice de la canción que está sonando ahora
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);

    // 2. Calculamos el siguiente índice
    // Si es la última canción, volverá a la primera (bucle)
    const nextIndex = (currentIndex + 1) % songs.length;

    // 3. Cambiamos la canción actual
    setCurrentSong(songs[nextIndex]);
    
    // Opcional: Registrar evento de reproducción para la nueva canción
    // trackEvent('playtime', songs[nextIndex].id, 1);
  };

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await api.get(`/songs?sort=${sort}`);
        setSongs(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, [sort]);

  useEffect(() => {
    setHasStarted(false);
  }, [currentSong]);

  if (loading) return <div style={{ padding: '20px' }}>{lang === 'es' ? 'Cargando biblioteca...' : 'Loading songs...'}</div>;

  return (
    /* 1. Cambiamos el contenedor principal para que permita elementos a ancho completo */
    <div className="explore-page-wrapper">
      
      {/* 2. SACAMOS EL HEADER DE LAS COLUMNAS: Ahora ocupará el 100% del ancho siempre */}
      <header className="sticky-header">
        <div className="header-inner-content">
          <h2 className="explore-title">{t.title}</h2>
          <div className="filter-container">
            {['oldest', 'recent', 'reproductions', 'name_desc'].map((f, i) => (
              <button 
                key={f}
                className={sort === f ? 'btn-filter active' : 'btn-filter'}
                onClick={() => setSort(f)}
              >
                {t[`filter${i+1}`]}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 3. CONTENEDOR DE COLUMNAS: Solo para la lista y el reproductor */}
      <div className="explore-main-content">
        <div className={`songs-column ${currentSong ? 'with-player' : ''}`}>
          <div className="songs-horizontal-list">
            {songs.map(song => (
              <div key={song.id} className={`horizontal-card ${currentSong?.id === song.id ? 'playing' : ''}`}>
                <img src={song.cover_path} className="card-cover-md" alt="" />
                
                <div className="card-content">
                  <div className="card-top-row">
                    <div className="card-main-info">
                      <h3 onClick={() => trackEvent('catalog_click', song.id, 1)}>{song.name}</h3>
                      <span className="card-type">{song.collection_name || 'Single'} • {new Date(song.release_date).getFullYear()}</span>
                    </div>
                    
                    <div className="card-stats-actions">
                      <span className="card-repros">{song.reproductions} 🎧</span>
                      <div className="card-icons">
                        <button onClick={() => handleInteraction(song.id, 'like')} className="icon-btn">
                          <ThumbsUp size={18} fill={song.is_liked ? "var(--color-btn-active)" : "none"} color={song.is_liked ? "var(--color-btn-active)" : "#b3b3b3"} />
                        </button>
                        <button onClick={() => handleInteraction(song.id, 'favorite')} className="icon-btn">
                          <Heart size={18} fill={song.is_favorite ? "var(--color-btn-active)" : "none"} color={song.is_favorite ? "var(--color-btn-active)" : "#b3b3b3"} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button className="btn-play-card" onClick={() => setCurrentSong(song)}>
                    ▶ {t.replay}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: REPRODUCTOR */}
        {currentSong && (
          <aside className="side-player-panel">
            <div className="side-player-card">
              <img src={currentSong.cover_path} className="side-player-cover" alt="" />
              <h3 className="side-player-title">{currentSong.name}</h3>
              <p className="side-player-subtitle">{currentSong.collection_name || 'Single'}</p>
              
              <audio 
                ref={audioRef}
                autoPlay 
                onPlay={handlePlay}
                onPause={handlePauseOrEnd}
                onEnded={() => { handlePauseOrEnd(); playNextSong(); }}
                controls
                src={currentSong.audio_path}
                className="custom-audio-player"
                onLoadedData={(e) => e.target.volume = 0.5}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default Explore;