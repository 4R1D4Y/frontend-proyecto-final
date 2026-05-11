import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * AuthContext & AuthProvider
 * 
 * Este componente implementa el patrón "Provider", creando un contexto global
 * que centraliza la seguridad y las preferencias de la aplicación.
 * Gestiona el ciclo de vida de la sesión del usuario y la internacionalización (i18n).
 */

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Estado global del usuario (null si no está autenticado)
    const [user, setUser] = useState(null);
    // Estado de carga para evitar parpadeos visuales durante la verificación del token
    const [loading, setLoading] = useState(true);

    /**
     * Gestión de Internacionalización (i18n):
     * Inicializa el idioma recuperándolo del almacenamiento local (persistence)
     * o estableciendo 'es' (español) por defecto.
     */
    const [lang, setLang] = useState(localStorage.getItem('LANGUAGE_PREF') || 'es');

    /**
     * Función changeLanguage:
     * Actualiza el estado global de la interfaz y persiste la elección del usuario
     * en el navegador para futuras sesiones.
     */
    const changeLanguage = (newLang) => {
        localStorage.setItem('LANGUAGE_PREF', newLang);
        setLang(newLang);
    };

    /**
     * Efecto de Verificación de Sesión (On Mount):
     * Al cargar la aplicación, comprueba la existencia de un token JWT en localStorage.
     * Si existe, valida su vigencia contra el endpoint de Laravel Sanctum.
     */
    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('AUTH_TOKEN');
            if (token) {
                try {
                    // Petición asíncrona para recuperar el perfil del usuario autenticado
                    const res = await api.get('/user'); 
                    setUser(res.data);
                } catch (error) {
                    // Si el token es inválido o ha expirado, se limpia el almacenamiento
                    localStorage.removeItem('AUTH_TOKEN');
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    /**
     * Función login:
     * Envía las credenciales a la API, almacena el token de acceso (Bearer Token)
     * y actualiza el estado global con la información del usuario devuelta.
     */
    const login = async (credentials) => {
        const res = await api.post('/login', credentials);
        localStorage.setItem('AUTH_TOKEN', res.data.token);
        setUser(res.data.user);
        return res.data.user;
    };

    /**
     * Función logout:
     * Implementa una salida segura. Primero intenta informar al servidor para
     * invalidar el token y, mediante un bloque 'finally', asegura la limpieza
     * del estado local incluso si el servidor no responde (Fallo Seguro).
     */
    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.warn("Sesión ya expirada en el servidor o error de red");
        } finally {
            // Limpieza crítica: se ejecuta independientemente del éxito de la petición
            localStorage.removeItem('AUTH_TOKEN');
            setUser(null);
        }
    };

    return (
        /**
         * El Provider expone tanto los datos (user, lang) como las acciones
         * (login, logout, changeLanguage) a cualquier componente de la aplicación.
         * El renderizado de 'children' se bloquea hasta que 'loading' es false.
         */
        <AuthContext.Provider value={{ user, login, logout, loading, lang, changeLanguage }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext);