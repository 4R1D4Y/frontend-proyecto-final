import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Heart, ThumbsUp, Play, Clock, Calendar } from 'lucide-react';
import { favoritesTranslations } from '../lang/favoritesTranslations';
import { trackEvent } from '../utils/analytics';
import "../styles/favorites.css";

/**
 * Componente Favorites
 * 
 * Gestiona la biblioteca personal del usuario. Implementa lógica compleja de 
 * reproducción secuencial (Next Song), gestión de interacciones asíncronas 
 * (Like/Remove) y un sistema de telemetría para medir el tiempo de escucha real.
 */

const Favorites = () => {
  const { user, lang } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  
  // Referencia al nodo del DOM del elemento audio para control directo
  const audioRef = useRef(null);
  
  // Estados para el control de métricas de reproducción
  const [lastTrackedTime, setLastTrackedTime] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const t = favoritesTranslations[lang];

  /**
   * Lógica de Telemetría (Play):
   * Registra el inicio de una nueva reproducción y marca el tiempo de inicio
   * para el cálculo posterior de la duración escuchada.
   */
  const handlePlay = () => {
    if (!hasStarted) {
        trackEvent('playtime', currentSong.id, 0, { action: 'new_play' });
        setHasStarted(true);
    }
    setLastTrackedTime(audioRef.current.currentTime);
  };

  /**
   * Lógica de Telemetría (Pause/End):
   * Calcula el tiempo neto escuchado comparando la marca de tiempo actual 
   * con la última registrada. Implementa un filtro de 2 segundos para 
   * evitar registrar ruidos o clics accidentales.
   */
  const handlePauseOrEnd = () => {
    if (!audioRef.current) return;

    const currentTime = audioRef.current.currentTime;
    const elapsed = Math.round(currentTime - lastTrackedTime);

    if (elapsed >= 2) {
      trackEvent('playtime', currentSong.id, elapsed);
      setLastTrackedTime(currentTime);
    }
  };

  /**
   * Sistema de Reproducción Secuencial:
   * Implementa un algoritmo de búsqueda de índice para saltar automáticamente 
   * a la siguiente pista de la lista al finalizar la actual (Bucle infinito).
   */
  const playNextSong = () => {
    if (!currentSong) return;
    const currentIndex = favorites.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % favorites.length;
    setCurrentSong(favorites[nextIndex]);
  };

  /**
   * Formateador de tiempo:
   * Transforma segundos brutos en formato MM:SS para una visualización estándar.
   */
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Carga inicial de datos mediante la API REST de Laravel
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await api.get('/user/favorites');
        setFavorites(res.data);
      } catch (error) {
        console.error("Error cargando favoritos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  // Reset del estado de tracking al cambiar de canción
  useEffect(() => {
    setHasStarted(false);
  }, [currentSong]);

  /**
   * Gestión de Interacciones (Like/Dislike):
   * Actualización optimista del estado local para garantizar que la UI 
   * responda instantáneamente al clic del usuario.
   */
  const handleLike = async (songId) => {
    try {
      const res = await api.post(`/songs/${songId}/like`);
      setFavorites(favorites.map(song => {
        if (song.id === songId) {
          return { ...song, is_liked: res.data.is_liked };
        }
        return song;
      }));
    } catch (error) {
      console.error("Error al procesar like:", error);
    }
  };

  /**
   * Eliminación de Favoritos:
   * Sincroniza la baja en el servidor y filtra el array local para 
   * evitar una nueva petición de carga (re-fetch).
   */
  const removeFavorite = async (songId) => {
    try {
      await api.post(`/songs/${songId}/favorite`);
      setFavorites(favorites.filter(song => song.id !== songId));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>{t.loading}</div>;

  return (
    <div className="favorites-page-wrapper">
      <h1 className="page-title">{t.title}</h1>

      <div className="favorites-main-content">
        {/* COLUMNA IZQUIERDA: TABLA */}
        <div className={`favorites-column ${currentSong ? 'with-player' : ''}`}>
          {favorites.length === 0 ? (
            <p className="no-favorites-msg">{t.no_songs}</p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table favorites-table fav-table">
                <thead>
                  <tr>
                    <th>{t.cover || '#'}</th>
                    <th>{t.name || 'Nombre'}</th>
                    <th>{t.type || 'Tipo'}</th>
                    <th><Calendar size={14} /> {t.saved || 'Guardado'}</th>
                    <th><Clock size={14} /></th>
                    <th>{t.actions || 'Acciones'}</th>
                  </tr>
                </thead>
                <tbody>
                  {favorites.map(song => (
                    <tr key={song.id} className={currentSong?.id === song.id ? 'active-row' : ''}>
                      <td>
                        <img src={song.cover_path} className="admin-mini-cover" alt="" />
                      </td>
                      
                      <td data-label={t.name || 'Nombre'}>
                        <span className="song-name-cell">{song.name}</span>
                      </td>
                      
                      <td data-label={t.type || 'Tipo'}>
                        <span className="badge-type">{song.collection_name || 'Single'}</span>
                      </td>
                      
                      <td data-label={t.saved || 'Guardado'} className="fav-date-cell">
                        {new Date(song.saved_date).toLocaleDateString()}
                      </td>
                      
                      <td data-label="Duración" className="fav-duration-cell">
                        {formatDuration(song.duration)}
                      </td>
                      
                      <td data-label={t.actions || 'Acciones'}>
                        <div className="admin-actions-btns">
                          <button onClick={() => handleLike(song.id)} className="btn-action">
                            <ThumbsUp 
                              size={18} 
                              fill={song.is_liked ? "var(--color-accent)" : "none"} 
                              color={song.is_liked ? "var(--color-accent)" : "#b3b3b3"} 
                            />
                          </button>
                          
                          <button onClick={() => removeFavorite(song.id)} className="btn-action delete">
                            <Heart size={18} fill="var(--color-accent)" color="var(--color-accent)" />
                          </button>

                          <button onClick={() => setCurrentSong(song)} className="btn-action edit">
                            <Play size={18} fill="currentColor" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: REPRODUCTOR FIJO */}
        {currentSong && (
          <aside className="side-player-panel">
            <div className="side-player-card">
              <img src={currentSong.cover_path} className="side-player-cover" alt="" />
              <div className="side-player-info">
                <h3 className="side-player-title">{currentSong.name}</h3>
                <p className="side-player-subtitle">{currentSong.collection_name || 'Single'}</p>
              </div>
              
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

export default Favorites;
