import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Heart } from 'lucide-react';
import { favoritesTranslations } from '../lang/favoritesTranslations';
import { trackEvent } from '../utils/analytics';

const Favorites = () => {
  const { user, lang } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const audioRef = useRef(null);
  const [lastTrackedTime, setLastTrackedTime] = useState(0);
  const t = favoritesTranslations[lang];

  const handlePlay = () => {
    // Guardamos el segundo exacto donde el usuario inicia/reanuda
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
    <div style={{ padding: '20px', paddingBottom: '100px' }}>
      <h2>{t.title} ❤️</h2>
      
      {favorites.length === 0 ? (
        <p>{t.no_songs}</p>
      ) : (
        <div style={gridStyle}>
          {favorites.map(song => (
            <div key={song.id} style={cardStyle}>
              {/* Nota: Tu controlador devuelve 'cover' en lugar de 'cover_path' */}
              <img src={song.cover_path} alt={song.name} style={coverStyle} />
              <h3 style={titleStyle}>{song.name}</h3>
              <p style={{ fontSize: '0.8rem', color: '#666' }}>{t.date_saved} {new Date(song.saved_date).toLocaleDateString()}</p>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={() => removeFavorite(song.id)} style={iconBtnStyle}>
                  <Heart size={20} fill="#1db954" color="#1db954" />
                </button>
                <button 
                  style={playBtnStyle} 
                  onClick={() => setCurrentSong({ ...song, audio_path: song.audio_path, cover_path: song.cover_path })}
                >
                    ▶ {t.replay}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reproductor compartido */}
      {currentSong && (
        <div style={playerBarStyle}>
          <img src={currentSong.cover_path} style={{ width: '50px', borderRadius: '4px' }} alt="" />
          <p style={{ margin: 0, fontWeight: 'bold' }}>{currentSong.name}</p>
          <audio
            ref={audioRef} 
            autoPlay
            onPlay={handlePlay}
            onPause={handlePauseOrEnd}
            onEnded={() => {
              handlePauseOrEnd(); // Registramos los segundos de la que acaba de terminar
              playNextSong();     // Saltamos a la siguiente
            }}
            controls 
            src={currentSong.audio_path} 
            style={{ width: '40%' }} />
        </div>
      )}
    </div>
  );
};

// Reutilizamos estilos de Explore
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '25px', marginTop: '20px' };
const cardStyle = { background: '#181818', padding: '15px', borderRadius: '10px', color: 'white' };
const coverStyle = { width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '8px' };
const titleStyle = { fontSize: '1rem', margin: '5px 0' };
const iconBtnStyle = { background: 'none', border: 'none', cursor: 'pointer' };
const playBtnStyle = { flex: 1, padding: '8px', borderRadius: '20px', border: 'none', background: '#1db954', color: 'white', cursor: 'pointer' };
const playerBarStyle = { position: 'fixed', bottom: 0, left: 0, width: '100%', height: '90px', background: '#282828', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 20px', zIndex: 1000, color: 'white' };

export default Favorites;
