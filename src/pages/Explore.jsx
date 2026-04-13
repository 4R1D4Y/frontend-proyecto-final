import { useEffect, useState } from 'react';
import api from '../api/axios';

const Explore = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);

  // URL base para las imágenes (definida en tu .env de React)
  const storageUrl = import.meta.env.VITE_STORAGE_URL;

  useEffect(() => {
  const fetchSongs = async () => {
    try {
      const res = await api.get('/songs');
      setSongs(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchSongs();
}, []);

  if (loading) return <div style={{ padding: '20px' }}>Cargando biblioteca...</div>;

  return (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <h2>Explorar Música</h2>
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

            <h3 style={titleStyle}>{song.name}</h3>
            
            <div style={infoStyle}>
              <span>{song.collection_name || 'Single'}</span>
              <span> • </span>
              <span>{song.reproductions} 🎧</span>
            </div>

            <button 
                style={playBtnStyle} 
                onClick={() => setCurrentSong(song)} // <--- Al hacer clic, enviamos la canción al reproductor
                >
                ▶ Reproducir
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
                autoPlay 
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
  fontSize: '0.8rem',
  color: '#b3b3b3',
  marginBottom: '15px'
};

const playBtnStyle = {
  width: '100%',
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

export default Explore;