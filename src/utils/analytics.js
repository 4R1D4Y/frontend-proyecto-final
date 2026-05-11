import api from '../api/axios';
/**
 * Servicio de Telemetría y Seguimiento de Eventos.
 * 
 * Esta función permite registrar interacciones clave del usuario con la plataforma 
 * (reproducciones, clics en redes sociales, visualización de licencias, etc.) 
 * enviando los datos al backend para su posterior análisis estadístico.
 *
 * @param {string} type - Tipo de evento (ej: 'playtime', 'catalog_click').
 * @param {number|null} songId - ID de la canción relacionada (opcional).
 * @param {number} value - Valor numérico asociado al evento (ej: duración escuchada).
 * @param {object} metadata - Información adicional en formato JSON.
 */

export const trackEvent = async (type, songId = null, value = 0, metadata = {}) => {
    try {
        // Petición asíncrona al endpoint de analítica de la API de Laravel
        await api.post('/events', {
            event_type: type,
            song_id: songId,
            value: value,
            metadata: metadata
        });
    } catch (error) {
        /**
         * Manejo de errores: Fallo Silencioso.
         * Se decide no mostrar alertas al usuario ante fallos de red en el tracking
         * para garantizar que la experiencia de navegación o reproducción no se vea
         * interrumpida por procesos secundarios de analítica.
         */
        console.error("Error tracking event:", type, error);
    }
};