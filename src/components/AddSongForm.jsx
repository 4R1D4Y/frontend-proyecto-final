import { useState } from 'react';
import Swal from 'sweetalert2';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { addSongFormTranslations } from '../lang/addSongFormTranslations';

/**
 * Componente AddSongForm
 * 
 * Gestiona la creación de nuevos registros musicales en la base de datos.
 * Maneja de forma asíncrona tanto metadatos (texto) como archivos binarios (Blob).
 */

const AddSongForm = ({ allSongs, onSongAdded }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Internacionalización: Obtención de etiquetas según el idioma del contexto
    const { lang } = useAuth();
    const t = addSongFormTranslations[lang];

    // Estados independientes para archivos multimedia
    const [audioFile, setAudioFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);

    // Estado unificado para el formulario
    const [formData, setFormData] = useState({
        name: '',
        type: 'single',
        release_date: '',
        duration: 0,
        collection_name: '',
        collection_order: 1
    });

    /**
     * Lógica de autogestión de colecciones.
     * Al escribir el nombre de un álbum/EP, filtra las canciones existentes 
     * para calcular automáticamente el siguiente número de orden.
     */
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

    /**
     * Envío de datos mediante objeto FormData.
     * Esencial para permitir la subida de archivos binarios (multipart/form-data)
     * hacia el servidor Laravel.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('type', formData.type);
        data.append('release_date', formData.release_date);
        data.append('duration', formData.duration);
        data.append('collection_name', formData.collection_name || '');
        data.append('collection_order', formData.collection_order || '');
        
        // Adjuntamos archivos físicos
        data.append('audio_path', audioFile);
        data.append('cover_path', coverFile);

        try {
            await api.post('/admin/songs', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Feedback visual mediante SweetAlert2
            Swal.fire({
              title: t.uploaded_t,
              text: t.uploaded_d,
              icon: 'success',
              confirmButtonColor: '#1db954',
              background: '#181818',
              color: '#fff'
            });
            onSongAdded(); // Refresco de la lista en el componente padre
        } catch (err) {
            setError(err.response?.data?.message || t.uploadingError);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Cálculo de metadatos en tiempo real.
     * Crea un objeto de audio temporal para extraer la duración (en segundos)
     * del archivo seleccionado por el usuario antes de la subida.
     */
    const calculateDuration = (file) => {
      return new Promise((resolve) => {
        const audio = new Audio();
        audio.src = URL.createObjectURL(file);
        audio.onloadedmetadata = () => {
          resolve(Math.round(audio.duration));
        };
      });
    };

    /**
     * Handler para el archivo de audio.
     * Automatiza la extracción de duración para evitar que el usuario deba 
     * introducirla manualmente, reduciendo el error humano.
     */
    const handleAudioChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setAudioFile(file);
        const seconds = await calculateDuration(file);
        setFormData(prev => ({ ...prev, duration: seconds }));
      }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-add-song-form">
            <div className="form-grid">
                {/* Grupos de inputs con labels traducidos dinámicamente */}
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

                {/* Select de tipo de lanzamiento */}
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

                {/* Renderizado condicional para campos de álbum/EP */}
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

                <div className="admin-input-group">
                    <label>{t.inputDate_t}</label>
                    <input 
                        type="date" 
                        className="admin-input"
                        required 
                        onChange={e => setFormData({...formData, release_date: e.target.value})} 
                    />
                </div>

                {/* Input de duración en modo solo lectura (calculado automáticamente) */}
                <div className="admin-input-group">
                    <label>{t.inputDuration_t}</label>
                    <input 
                        type="number" 
                        className="admin-input readonly"
                        value={formData.duration} 
                        readOnly 
                    />
                </div>

                {/* Secciones de carga de archivos binarios */}
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
