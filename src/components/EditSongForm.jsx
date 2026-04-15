import { useState } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { editSongFormTranslations } from '../lang/editSongFormTranslations';

const EditSongForm = ({ song, allSongs, onSongUpdated, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [audioFile, setAudioFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [duration, setDuration] = useState(song.duration);

    const { lang } = useAuth();
    const t = editSongFormTranslations[lang];

    const [formData, setFormData] = useState({
        name: song.name,
        type: song.type,
        release_date: song.release_date,
        duration: song.duration,
        collection_name: song.collection_name || '',
        collection_order: song.collection_order || 1
    });

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

    const calculateDuration = (file) => {
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.src = URL.createObjectURL(file);
            audio.onloadedmetadata = () => {
                resolve(Math.round(audio.duration));
            };
        });
    };

    const handleAudioChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setAudioFile(file);
            // Calculamos la nueva duración y actualizamos el estado
            const newDuration = await calculateDuration(file);
            setDuration(newDuration);
        }
    };

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
        
        data.append('_method', 'PUT');

        if (audioFile) data.append('audio_path', audioFile);
        if (coverFile) data.append('cover_path', coverFile);

        try {
            await api.post(`/admin/songs/${song.id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            Swal.fire({ title: t.updated_t, icon: 'success', background: '#181818', color: '#fff' });
            onSongUpdated();
        } catch (err) {
            Swal.fire({ title: t.updatedError_t, text: t.updatedError_d, icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Fondo oscuro tras el panel para centrar la atención */}
            <div style={overlayStyle} onClick={onCancel}></div>
            
            {/* Panel Lateral */}
            <div style={drawerStyle}>
                <div style={drawerHeader}>
                    <h3>{t.title}</h3>
                    <button onClick={onCancel} style={btnClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={formStyle}>
                    <div style={scrollContentStyle}>
                        <label>{t.inputName_t}</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} required />
                        
                        <label>{t.inputType_t}</label>
                        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={inputStyle}>
                            <option value="single">Single</option>
                            <option value="ep">EP</option>
                            <option value="album">Album</option>
                        </select>

                        {formData.type !== 'single' && (
                            <div style={{ background: '#f0f7f2', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{t.collectionName_t || 'Colección'}</label>
                                <input 
                                    type="text" 
                                    value={formData.collection_name} 
                                    onChange={e => handleCollectionNameChange(e.target.value)} 
                                    style={inputStyle} 
                                />
                                
                                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{t.collectionOrder_t || 'Orden'}</label>
                                <input 
                                    type="number" 
                                    value={formData.collection_order} 
                                    onChange={e => setFormData({...formData, collection_order: e.target.value})} 
                                    style={inputStyle} 
                                />
                            </div>
                        )}

                        <label>{t.inputDate_t}</label>
                        <input type="date" value={formData.release_date} onChange={e => setFormData({...formData, release_date: e.target.value})} style={inputStyle} required />

                        <div style={fileBox}>
                            <label>{t.inputAudio_t}</label>
                            <input type="file" accept="audio/*" onChange={handleAudioChange} />
                            <p style={{fontSize: '0.7rem', color: '#1db954', marginTop: '5px'}}>
                                {t.newDuration} {duration} {t.sec}.
                            </p>
                        </div>

                        <div style={fileBox}>
                            <label>{t.inputCover_t}</label>
                            <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} />
                        </div>

                        
                    </div>
                    <div style={actionsContainer}>
                            <button type="submit" disabled={loading} style={btnSave}>
                                {loading ? t.loading : t.saveChanges}
                            </button>
                            <button type="button" onClick={onCancel} style={btnCancel}>{t.cancel}</button>
                        </div>
                </form>
            </div>
        </>
    );
};

// --- ESTILOS DEL PANEL LATERAL ---
const overlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.5)', zIndex: 1200
};

const drawerStyle = {
    position: 'fixed', top: 0, right: 0, width: '400px', height: '100%',
    background: '#fff', boxShadow: '-5px 0 15px rgba(0,0,0,0.2)',
    zIndex: 1300, padding: '30px', display: 'flex', flexDirection: 'column',
    animation: 'slideIn 0.3s ease-out'
};

const scrollContentStyle = {
    flex: 1,           // Ocupa todo el espacio disponible
    overflowY: 'auto', // Permite scroll interno si el contenido es largo
    paddingRight: '10px',
    marginBottom: '20px'
};

const actionsContainer = { 
    marginTop: 'auto', // Se queda siempre al final
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px',
    paddingTop: '15px',
    borderTop: '1px solid #eee' // Una línea sutil para separar los botones
};

const drawerHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' };
const btnClose = { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc' };
const fileBox = { background: '#f4f4f4', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontSize: '0.8rem' };
const btnSave = { background: '#1db954', color: 'white', padding: '12px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' };
const btnCancel = { background: '#eee', color: '#333', padding: '12px', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const formStyle = { display: 'flex', flexDirection: 'column', height: 'calc(100% - 140px)' };

export default EditSongForm;