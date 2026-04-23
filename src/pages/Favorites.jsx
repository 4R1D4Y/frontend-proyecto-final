import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Heart, ThumbsUp, Play, Clock, Calendar } from 'lucide-react';
import { favoritesTranslations } from '../lang/favoritesTranslations';
import { trackEvent } from '../utils/analytics';

import "../styles/favorites.css";

const Favorites = () => {
  const { user, lang } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const audioRef = useRef(null);
  const [lastTrackedTime, setLastTrackedTime] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const t = favoritesTranslations[lang];

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

  const playNextSong = () => {
    if (!currentSong) return;

    // 1. Buscamos el índice de la canción que está sonando ahora
    const currentIndex = favorites.findIndex(s => s.id === currentSong.id);

    // 2. Calculamos el siguiente índice
    // Si es la última canción, volverá a la primera (bucle)
    const nextIndex = (currentIndex + 1) % favorites.length;

    // 3. Cambiamos la canción actual
    setCurrentSong(favorites[nextIndex]);
    
    // Opcional: Registrar evento de reproducción para la nueva canción
    // trackEvent('playtime', favorites[nextIndex].id, 1);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  useEffect(() => {
    setHasStarted(false);
  }, [currentSong]);

  const removeFavorite = async (songId) => {
    try {
      await api.post(`/songs/${songId}/favorite`);
      // Eliminamos la canción de la lista visualmente
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
            <div className="admin-table-wrapper"> {/* Reutilizamos estructura de Admin */}
              <table className="admin-table favorites-table">
                <thead>
                  <tr>
                    <th>{t.songsColumnCover || '#'}</th>
                    <th>{t.songsColumnName || 'Nombre'}</th>
                    <th>{t.songsColumnType || 'Tipo'}</th>
                    <th><Calendar size={14} /> {t.date_saved || 'Guardado'}</th>
                    <th><Clock size={14} /></th>
                    <th>{t.songsColumnActions || 'Acciones'}</th>
                  </tr>
                </thead>
                <tbody>
                  {favorites.map(song => (
                    <tr key={song.id} className={currentSong?.id === song.id ? 'active-row' : ''}>
                      <td><img src={song.cover_path} className="admin-mini-cover" alt="" /></td>
                      <td><span className="song-name-cell">{song.name}</span></td>
                      <td><span className="badge-type">{song.collection_name || 'Single'}</span></td>
                      <td className="fav-date-cell">{new Date(song.saved_date).toLocaleDateString()}</td>
                      <td className="fav-duration-cell">{formatDuration(song.duration)}</td>
                      <td>
                        <div className="admin-actions-btns">
                          {/* BOTÓN LIKE (Placeholder visual ya que no tienes la función de quitar like aquí aún) */}
                          <button className="btn-action"><ThumbsUp size={18} color="#b3b3b3" /></button>
                          
                          {/* BOTÓN FAVORITO (Quitar) */}
                          <button onClick={() => removeFavorite(song.id)} className="btn-action delete">
                            <Heart size={18} fill="var(--color-accent)" color="var(--color-accent)" />
                          </button>

                          {/* BOTÓN REPRODUCIR */}
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

export default Favorites;
