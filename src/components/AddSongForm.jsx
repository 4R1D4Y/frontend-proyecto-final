import { useState } from 'react';
import Swal from 'sweetalert2';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { addSongFormTranslations } from '../lang/addSongFormTranslations';

const AddSongForm = ({ onSongAdded }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { lang } = useAuth();
    const t = addSongFormTranslations[lang];

    // Estados para los archivos
    const [audioFile, setAudioFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);

    // Estados para los textos
    const [formData, setFormData] = useState({
        name: '',
        type: 'single',
        release_date: '',
        duration: '',
        collection_name: '',
        collection_order: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // IMPORTANTE: Para enviar archivos usamos FormData
        const data = new FormData();
        data.append('name', formData.name);
        data.append('type', formData.type);
        data.append('release_date', formData.release_date);
        data.append('duration', formData.duration);
        data.append('collection_name', formData.collection_name || '');
        data.append('collection_order', formData.collection_order || '');
        
        // Estos nombres deben coincidir con los de tu AdminController ($request->file('...'))
        data.append('audio_path', audioFile);
        data.append('cover_path', coverFile);

        try {
            await api.post('/admin/songs', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            Swal.fire({
              title: t.uploaded_t,
              text: t.uploaded_d,
              icon: 'success',
              confirmButtonColor: '#1db954', // El verde de tu app
              background: '#181818',
              color: '#fff'
            });
            onSongAdded(); // Refresca la lista y cierra el form
        } catch (err) {
            setError(err.response?.data?.message || t.uploadingError);
        } finally {
            setLoading(false);
        }
    };

    const calculateDuration = (file) => {
      return new Promise((resolve) => {
        const audio = new Audio();
        audio.src = URL.createObjectURL(file);
        audio.onloadedmetadata = () => {
          // Obtenemos la duración en segundos (redondeando)
          resolve(Math.round(audio.duration));
        };
      });
    };

    const handleAudioChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setAudioFile(file);
        
        // Calculamos la duración automáticamente
        const seconds = await calculateDuration(file);
        setFormData(prev => ({ ...prev, duration: seconds }));
      }
    };

    return (
        <form onSubmit={handleSubmit} style={formGrid}>
            <div style={inputGroup}>
                <label>{t.inputName_t}</label>
                <input type="text" required onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>

            <div style={inputGroup}>
                <label>{t.inputType_t}</label>
                <select onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="single">Single</option>
                    <option value="ep">EP</option>
                    <option value="album">Album</option>
                </select>
            </div>

            <div style={inputGroup}>
                <label>{t.inputDate_t}</label>
                <input type="date" required onChange={e => setFormData({...formData, release_date: e.target.value})} />
            </div>

            <div style={inputGroup}>
                <label>{t.inputDuration_t}</label>
                <input type="number" value={formData.duration} readOnly style={{ background: '#eee' }} />
            </div>

            <div style={inputGroup}>
                <label>{t.inputAudio_t}</label>
                <input type="file" accept="audio/mp3,audio/wav,audio/x-m4a,audio/m4a" required onChange={handleAudioChange} />
            </div>

            <div style={inputGroup}>
                <label>{t.inputCover_t}</label>
                <input type="file" accept="image/*" required onChange={e => setCoverFile(e.target.files[0])} />
            </div>

            <div style={{gridColumn: '1 / -1'}}>
                <button type="submit" disabled={loading} style={btnSubmit}>
                    {loading ? t.uploading : t.uploadingSave}
                </button>
                {error && <p style={{color: 'red', marginTop: '10px'}}>{error}</p>}
            </div>
        </form>
    );
};

// --- ESTILOS ---
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
const btnSubmit = { padding: '12px', background: '#1db954', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' };

export default AddSongForm;
