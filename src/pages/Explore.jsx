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
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <div style={headerStyle}>
        <h2>{t.title}</h2>
        
        {/* BOTONES DE FILTRADO */}
        <div style={filterContainerStyle}>
          <button className={sort === 'oldest' ? 'btn-filter active' : 'btn-filter'}
            onClick={() => setSort('oldest')} 
            // style={sort === 'oldest' ? activeFilterStyle : filterBtnStyle}
          >
            {t.filter1}
          </button>
          <button className={sort === 'recent' ? 'btn-filter active' : 'btn-filter'}
            onClick={() => setSort('recent')} 
            // style={sort === 'recent' ? activeFilterStyle : filterBtnStyle}
          >
            {t.filter2}
          </button>
          <button className={sort === 'reproductions' ? 'btn-filter active' : 'btn-filter'}
            onClick={() => setSort('reproductions')} 
            // style={sort === 'reproductions' ? activeFilterStyle : filterBtnStyle}
          >
            {t.filter3}
          </button>
          <button className={sort === 'name_desc' ? 'btn-filter active' : 'btn-filter'}
            onClick={() => setSort('name_desc')} 
            // style={sort === 'name_desc' ? activeFilterStyle : filterBtnStyle}
          >
            {t.filter4}
          </button>
        </div>
      </div>

      <div style={gridStyle}>
        {songs.map(song => (
          <div key={song.id} style={cardStyle}>
            {/* Imagen de carátula real desde el storage de Laravel */}
            <img 
                // Usamos URL() para asegurar que la ruta se construya bien sin importar las barras
                src={song.cover_path} 
                alt={song.name}
                style={coverStyle}
                onError={(e) => { 
                    e.target.onerror = null; 
                }} 
            />

            <h3 style={titleStyle}
              onClick={() => trackEvent('catalog_click', song.id, 1)}
            >{song.name}</h3>
            
            <div style={infoStyle}>
              <span style={detailStyle}>{song.collection_name || 'Single'}</span>
              <span style={detailStyle}>{new Date(song.release_date).toLocaleDateString()}</span> 
              <span style={detailStyle}>{song.reproductions} 🎧</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {/* BOTÓN LIKE (ThumbsUp) */}
              <button 
                onClick={() => handleInteraction(song.id, 'like')}
                style={iconBtnStyle}
              >
                <ThumbsUp size={20} fill={song.is_liked ? "#1db954" : "none"} color={song.is_liked ? "#1db954" : "#b3b3b3"} />
              </button>

              {/* BOTÓN FAVORITO (Heart) */}
              <button 
                onClick={() => handleInteraction(song.id, 'favorite')}
                style={iconBtnStyle}
              >
                <Heart size={20} fill={song.is_favorite ? "#1db954" : "none"} color={song.is_favorite ? "#1db954" : "#b3b3b3"} />
              </button>
            </div>

            <button 
                style={playBtnStyle} 
                onClick={() => setCurrentSong(song)} // <--- Al hacer clic, enviamos la canción al reproductor
                >
                ▶ {t.replay}
            </button>
          </div>
        ))}
      </div>

      {currentSong && (
          <div style={playerBarStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '30%' }}>
              <img src={currentSong.cover_path} style={{ width: '50px', borderRadius: '4px' }} alt="" />
              <div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{currentSong.name}</p>
              </div>
              </div>

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
              src={currentSong.audio_path} // Asumiendo que también viene la URL completa
              style={{ width: '40%' }}
              />
              
              <div style={{ width: '30%' }}></div> {/* Espacio para el volumen después */}
          </div>
      )}
    </div>
  );
};

// --- ESTILOS ---
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '25px',
  marginTop: '20px'
};

const cardStyle = {
  background: '#181818', // Estilo oscuro tipo Spotify
  padding: '15px',
  borderRadius: '10px',
  color: 'white',
  transition: 'background 0.3s'
};

const coverStyle = {
  width: '100%',
  aspectRatio: '1/1',
  objectFit: 'cover',
  borderRadius: '8px',
  marginBottom: '10px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
};

const titleStyle = {
  fontSize: '1rem',
  margin: '5px 0',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const infoStyle = {
  display: 'flex',
  flexDirection: 'column',
  fontSize: '0.8rem',
  color: '#b3b3b3',
  marginBottom: '15px'
};

const detailStyle = {
  padding: '2px 0px'
}

const playBtnStyle = {
  width: '100%',
  marginTop: '10px',
  padding: '8px',
  borderRadius: '20px',
  border: 'none',
  background: '#1db954',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer'
};

const playerBarStyle = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  width: '100%',
  height: '90px',
  background: '#282828',
  color: 'white',
  borderTop: '1px solid #333',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 20px',
  zIndex: 1000
};

const iconBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '5px',
  display: 'flex',
  alignItems: 'center',
  transition: 'transform 0.2s'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  flexWrap: 'wrap',
  gap: '10px',
  position: 'sticky',
  top: '80px', // Esta distancia debe ser la altura aproximada de tu Navbar
  background: '#fff', // O el color de fondo de tu página para que no se transparente el texto de abajo
  padding: '10px 0',
  zIndex: 1000
};

const filterContainerStyle = {
  display: 'flex',
  gap: '10px'
};

const filterBtnStyle = {
  background: '#282828',
  color: 'white',
  border: '1px solid #444',
  padding: '6px 15px',
  borderRadius: '20px',
  cursor: 'pointer',
  fontSize: '0.9rem'
};

const activeFilterStyle = {
  ...filterBtnStyle,
  background: '#1db954',
  borderColor: '#1db954',
  fontWeight: 'bold'
};

export default Explore;