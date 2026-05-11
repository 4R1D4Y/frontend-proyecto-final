import axios from 'axios';

/**
 * Configuración Centralizada de Axios.
 * 
 * Este módulo configura una instancia personalizada de Axios para gestionar todas
 * las peticiones HTTP de la aplicación hacia la API de Laravel. Centraliza la 
 * URL base y la inyección automática de tokens de seguridad.
 */

// Creación de la instancia personalizada con valores predeterminados
const api = axios.create({
    /**
     * Uso de variables de entorno (Vite):
     * Permite cambiar la URL de la API (localhost vs IP de red local)
     * sin modificar el código fuente, facilitando el despliegue.
     */
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // Indica a Laravel que es una petición AJAX
    }
});

/**
 * Interceptor de Peticiones (Requests):
 * 
 * Este middleware se ejecuta antes de cada envío al servidor.
 * Verifica si existe un token de sesión en el almacenamiento local y, 
 * de ser así, lo inyecta en la cabecera 'Authorization' siguiendo 
 * el estándar Bearer Token requerido por Laravel Sanctum.
 */
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
