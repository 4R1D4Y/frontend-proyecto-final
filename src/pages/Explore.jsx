import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { ThumbsUp, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { exploreTranslations } from '../lang/exploreTranslations';
import { trackEvent } from '../utils/analytics';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/explore.css';

/**
 * Componente Explore: Motor de descubrimiento musical del aplicativo.
 * 
 * Gestiona el catálogo de canciones permitiendo filtrado dinámico,
 * interacciones de usuario (Likes/Favoritos) con validación de sesión
 * y un sistema de reproducción con seguimiento de métricas (telemetría).
 */

const Explore = () => {
  const { user, lang } = useAuth();
  
  // Estados para la gestión de datos y UI
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null); // Canción en reproducción
  const [sort, setSort] = useState('oldest'); // Criterio de ordenación actual
  
  // Referencia para acceso directo al nodo de audio y sus propiedades nativas
  const audioRef = useRef(null);
  
  // Estados para el cálculo de telemetría de escucha real
  const [lastTrackedTime, setLastTrackedTime] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  
  const navigate = useNavigate();
  const t = exploreTranslations[lang];

  /**
   * Manejador de inicio de reproducción.
   * Si es el primer "play" de la pista seleccionada, registra el evento 
   * de nueva reproducción en el servidor mediante 'trackEvent'.
   */
  const handlePlay = () => {
    if (!hasStarted) {
        trackEvent('playtime', currentSong.id, 0, { action: 'new_play' });
        setHasStarted(true);
    }
    // Sincroniza la marca de tiempo para el cálculo de duración escuchada
    setLastTrackedTime(audioRef.current.currentTime);
  };

  /**
   * Gestión de Telemetría (Pausa/Fin):
   * Calcula el tiempo neto de escucha comparando el tiempo actual del audio 
   * con la última marca registrada. Solo envía datos si la escucha es >= 2 seg.
   */
  const handlePauseOrEnd = () => {
    if (!audioRef.current) return;

    const currentTime = audioRef.current.currentTime;
    const elapsed = Math.round(currentTime - lastTrackedTime);

    if (elapsed >= 2) {
      trackEvent('playtime', currentSong.id, elapsed);
      setLastTrackedTime(currentTime); // Actualiza la marca para tramos de escucha continuos
    }
  };

  /**
   * Manejador de Interacciones (Like/Favorito):
   * Incluye una barrera de seguridad: si el usuario no está autenticado,
   * se despliega una alerta (SweetAlert2) y se redirige al login.
   */
  const handleInteraction = async (songId, type) => {
    if (!user) {
      Swal.fire({
        title: t.alertTitle,
        text: t.alertText,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: t.alertConfirm,
        cancelButtonText: t.alertCancel,
        background: 'var(--color-card)',
        color: '#fff',
        confirmButtonColor: 'var(--color-accent)',
        cancelButtonColor: '#333',
      }).then((result) => {
        if (result.isConfirmed) navigate('/login');
      });
      return;
    }

    try {
      // Petición asíncrona a la API según el tipo de interacción
      const res = await api.post(`/songs/${songId}/${type}`);
      
      // Actualización "optimista" del estado local para respuesta inmediata de la UI
      setSongs(songs.map(song => {
        if (song.id === songId) {
          return { 
            ...song, 
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

  /**
   * Reproducción Secuencial (Auto-play):
   * Calcula el índice de la canción actual y selecciona la siguiente 
   * de forma circular dentro de la lista de canciones cargada.
   */
  const playNextSong = () => {
    if (!currentSong) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
  };

  /**
   * Efecto de carga: 
   * Se dispara cada vez que el criterio de ordenación (sort) cambia, 
   * realizando una petición GET con query params a la API de Laravel.
   */
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

  // Reinicia la bandera de inicio de trackeo al cambiar de canción
  useEffect(() => {
    setHasStarted(false);
  }, [currentSong]);

  if (loading) return <div style={{ padding: '20px' }}>{t.loading}</div>;

  return (
    <div className="explore-page-wrapper">
      {/* Header Sticky: Contiene los filtros dinámicos */}
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

      {/* Main Layout: Lista de canciones y Reproductor Lateral (Side Player) */}
      <div className="explore-main-content">
        <div className={`songs-column ${currentSong ? 'with-player' : ''}`}>
          <div className="songs-horizontal-list">
            {songs.map(song => (
              <div key={song.id} className={`horizontal-card ${currentSong?.id === song.id ? 'playing' : ''}`}>
                <img src={song.cover_path} className="card-cover-md" alt="" />
                <div className="card-content">
                  <div className="card-top-row">
                    <div className="card-main-info">
                      {/* Tracking de clic en catálogo para analítica de interés */}
                      <h3 onClick={() => trackEvent('catalog_click', song.id, 1)}>{song.name}</h3>
                      <span className="card-type">{song.collection_name || 'Single'} • {new Date(song.release_date).getFullYear()}</span>
                    </div>
                    <div className="card-stats-actions">
                      <span className="card-repros">{song.reproductions} 🎧</span>
                      <div className="card-icons">
                        {/* Botones de interacción con lógica de color dinámica basada en estado */}
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

        {/* Aside: Reproductor persistente por componente */}
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