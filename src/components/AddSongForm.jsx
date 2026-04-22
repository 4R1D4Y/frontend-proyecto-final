import { useState } from 'react';
import Swal from 'sweetalert2';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { addSongFormTranslations } from '../lang/addSongFormTranslations';

const AddSongForm = ({ allSongs, onSongAdded }) => {
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
        duration: 0,
        collection_name: '',
        collection_order: 1
    });

    const handleCollectionNameChange = (name) => {
        let nextOrder = 1;
        if (name.trim() !== '') {
            const albumSongs = allSongs.filter(s => 
                s.collection_name?.toLowerCase() === name.toLowerCase()
            );
            if (albumSongs.length > 0) {
                const maxOrder = Math.max(...albumSongs.map(s => s.collection_order || 0));
                nextOrder = maxOrder + 1;
            }
        }
        setFormData({ ...formData, collection_name: name, collection_order: nextOrder });
    };

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
        <form onSubmit={handleSubmit} className="admin-add-song-form">
            <div className="form-grid">
                {/* GRUPO: NOMBRE */}
                <div className="admin-input-group">
                    <label>{t.inputName_t}</label>
                    <input 
                        type="text" 
                        className="admin-input"
                        required 
                        placeholder='Ej: Octane'
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                </div>

                {/* GRUPO: TIPO */}
                <div className="admin-input-group">
                    <label>{t.inputType_t}</label>
                    <select 
                        className="admin-input"
                        onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                        <option value="single">Single</option>
                        <option value="ep">EP</option>
                        <option value="album">Album</option>
                    </select>
                </div>

                {/* SECCIÓN DINÁMICA DE COLECCIÓN */}
                {formData.type !== 'single' && (
                    <div className="collection-fields-container">
                        <div className="admin-input-group">
                            <label>{t.inputCollectionName_t}</label>
                            <input 
                                type="text" 
                                className="admin-input"
                                value={formData.collection_name}
                                onChange={e => handleCollectionNameChange(e.target.value)} 
                                placeholder="Ej: Adrenaline EP"
                            />
                        </div>
                        <div className="admin-input-group">
                            <label>{t.collectionOrder}</label>
                            <input 
                                type="number" 
                                className="admin-input"
                                value={formData.collection_order}
                                onChange={e => setFormData({...formData, collection_order: e.target.value})} 
                            />
                        </div>
                    </div>
                )}

                {/* GRUPO: FECHA */}
                <div className="admin-input-group">
                    <label>{t.inputDate_t}</label>
                    <input 
                        type="date" 
                        className="admin-input"
                        required 
                        onChange={e => setFormData({...formData, release_date: e.target.value})} 
                    />
                </div>

                {/* GRUPO: DURACIÓN (Solo lectura) */}
                <div className="admin-input-group">
                    <label>{t.inputDuration_t}</label>
                    <input 
                        type="number" 
                        className="admin-input readonly"
                        value={formData.duration} 
                        readOnly 
                    />
                </div>

                {/* GRUPO: ARCHIVOS */}
                <div className="admin-input-group">
                    <label>{t.inputAudio_t}</label>
                    <div className="file-input-wrapper">
                        <input 
                            type="file" 
                            accept="audio/mp3,audio/wav,audio/x-m4a,audio/m4a" 
                            required 
                            onChange={handleAudioChange} 
                        />
                    </div>
                </div>

                <div className="admin-input-group">
                    <label>{t.inputCover_t}</label>
                    <div className="file-input-wrapper">
                        <input 
                            type="file" 
                            accept="image/*" 
                            required 
                            onChange={e => setCoverFile(e.target.files[0])} 
                        />
                    </div>
                </div>

                {/* BOTÓN Y ERRORES */}
                <div className="form-actions-full">
                    <button type="submit" disabled={loading} className="admin-submit-btn">
                        {loading ? t.uploading : t.uploadingSave}
                    </button>
                    {error && <p className="admin-error-text">{error}</p>}
                </div>
            </div>
        </form>
    );
};

export default AddSongForm;
