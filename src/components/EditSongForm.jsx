import { useState } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { editSongFormTranslations } from '../lang/editSongFormTranslations';

/**
 * Componente EditSongForm
 * 
 * Interfaz de administración tipo "Drawer" para la edición de registros musicales.
 * Permite la actualización asíncrona de metadatos y archivos multimedia.
 */

const EditSongForm = ({ song, allSongs, onSongUpdated, onCancel }) => {
    // Estados para controlar el flujo de carga y la selección de nuevos archivos
    const [loading, setLoading] = useState(false);
    const [audioFile, setAudioFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [duration, setDuration] = useState(song.duration);

    // Internacionalización: Obtención de etiquetas según el idioma del contexto
    const { lang } = useAuth();
    const t = editSongFormTranslations[lang];

    // Estado unificado inicializado con los valores actuales del registro (song)
    const [formData, setFormData] = useState({
        name: song.name,
        type: song.type,
        release_date: song.release_date,
        duration: song.duration,
        collection_name: song.collection_name || '',
        collection_order: song.collection_order || 1
    });

    /**
     * Lógica de autogestión de colecciones (Álbumes/EPs).
     * Si se cambia el nombre de la colección, busca el orden más alto entre
     * las otras canciones de ese grupo para sugerir la posición siguiente.
     */
    const handleCollectionNameChange = (name) => {
        let nextOrder = 1;
        if (name.trim() !== '') {
            const albumSongs = allSongs.filter(s => 
                s.collection_name?.toLowerCase() === name.toLowerCase() && s.id !== song.id
            );
            if (albumSongs.length > 0) {
                const maxOrder = Math.max(...albumSongs.map(s => s.collection_order || 0));
                nextOrder = maxOrder + 1;
            }
        }
        setFormData({ ...formData, collection_name: name, collection_order: nextOrder });
    };

    /**
     * Cálculo de duración en cliente.
     * Crea un objeto de audio temporal para leer los metadatos del archivo local
     * y extraer la duración exacta sin necesidad de procesarlo en el servidor.
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
     * Handler para el cambio de archivo de audio.
     * Al detectar un nuevo archivo, dispara el cálculo de duración para actualizar 
     * los metadatos antes del envío.
     */
    const handleAudioChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setAudioFile(file);
            const newDuration = await calculateDuration(file);
            setDuration(newDuration);
        }
    };

    /**
     * Envío del formulario mediante FormData.
     * Se utiliza '_method: PUT' para simular un método PUT mediante una petición POST,
     * técnica necesaria en Laravel para procesar archivos binarios en actualizaciones.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('type', formData.type);
        data.append('release_date', formData.release_date);
        data.append('duration', duration); 
        data.append('collection_name', formData.collection_name || '');
        data.append('collection_order', formData.collection_order || '');
        
        // Simulación de método PUT para procesamiento de archivos en el backend
        data.append('_method', 'PUT');

        if (audioFile) data.append('audio_path', audioFile);
        if (coverFile) data.append('cover_path', coverFile);

        try {
            // Petición asíncrona hacia el endpoint administrativo de la API
            await api.post(`/admin/songs/${song.id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            Swal.fire({ title: t.updated_t, icon: 'success', background: '#181818', color: '#fff' });
            onSongUpdated(); // Refresco de la lista en el componente padre
        } catch (err) {
            Swal.fire({ title: t.updatedError_t, text: t.updatedError_d, icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Overlay para cerrar el panel al hacer clic fuera */}
            <div className="admin-drawer-overlay" onClick={onCancel}></div>
            
            <div className="admin-drawer">
                <div className="admin-drawer-header">
                    <h3>{t.title}</h3>
                    <button onClick={onCancel} className="btn-close-drawer">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="admin-drawer-form">
                    <div className="admin-drawer-scroll-content">
                        {/* Grupo: Nombre de la pista */}
                        <div className="admin-input-group">
                            <label>{t.inputName_t}</label>
                            <input 
                                type="text" 
                                className="admin-input"
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                required 
                            />
                        </div>
                        
                        {/* Selector: Tipo de lanzamiento */}
                        <div className="admin-input-group">
                            <label>{t.inputType_t}</label>
                            <select 
                                className="admin-input"
                                value={formData.type} 
                                onChange={e => setFormData({...formData, type: e.target.value})}
                            >
                                <option value="single">Single</option>
                                <option value="ep">EP</option>
                                <option value="album">Album</option>
                            </select>
                        </div>

                        {/* Renderizado condicional: Campos específicos para colecciones */}
                        {formData.type !== 'single' && (
                            <div className="collection-fields-container drawer-variant">
                                <div className="admin-input-group">
                                    <label>{t.inputCollectionName_t || 'Colección'}</label>
                                    <input 
                                        type="text" 
                                        className="admin-input"
                                        value={formData.collection_name} 
                                        onChange={e => handleCollectionNameChange(e.target.value)} 
                                    />
                                </div>
                                
                                <div className="admin-input-group">
                                    <label>{t.collectionOrder || 'Orden'}</label>
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
                                value={formData.release_date} 
                                onChange={e => setFormData({...formData, release_date: e.target.value})} 
                                required 
                            />
                        </div>

                        {/* Carga de archivos: Audio y Portada */}
                        <div className="file-input-wrapper drawer-variant">
                            <label className="admin-label-small">{t.inputAudio_t}</label>
                            <input type="file" accept="audio/*" onChange={handleAudioChange} />
                            <p className="duration-hint">
                                {t.newDuration} {duration} {t.sec}.
                            </p>
                        </div>

                        <div className="file-input-wrapper drawer-variant">
                            <label className="admin-label-small">{t.inputCover_t}</label>
                            <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} />
                        </div>
                    </div>

                    <div className="admin-drawer-actions">
                        <button type="submit" disabled={loading} className="admin-submit-btn">
                            {loading ? t.loading : t.saveChanges}
                        </button>
                        <button type="button" onClick={onCancel} className="admin-cancel-btn">
                            {t.cancel}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default EditSongForm;