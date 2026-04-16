import api from '../api/axios';

export const trackEvent = async (type, songId = null, value = 0, metadata = {}) => {
    try {
        await api.post('/events', {
            event_type: type,
            song_id: songId,
            value: value,
            metadata: metadata
        });
    } catch (error) {
        // Fallo silencioso para no interrumpir la experiencia del usuario
        console.error("Error tracking event:", type, error);
    }
};