import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Verificar si hay sesión al cargar la página
    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('AUTH_TOKEN');
            if (token) {
                try {
                    const res = await api.get('/user'); // Ruta de Laravel Sanctum
                    setUser(res.data);
                } catch (error) {
                    localStorage.removeItem('AUTH_TOKEN');
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    // 2. Función para iniciar sesión
    const login = async (credentials) => {
        const res = await api.post('/login', credentials);
        localStorage.setItem('AUTH_TOKEN', res.data.token);
        setUser(res.data.user);
        return res.data.user;
    };

    // 3. Función para cerrar sesión
    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            // Si el servidor falla (ej. error 419), ignoramos el error 
            // y seguimos con la limpieza local
            console.warn("Sesión ya expirada en el servidor");
        } finally {
            localStorage.removeItem('AUTH_TOKEN');
            setUser(null);
            // Al estar en el 'finally', esto se ejecuta SIEMPRE
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext);